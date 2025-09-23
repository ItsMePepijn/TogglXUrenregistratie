import { Injectable } from '@angular/core';
import { BehaviorSubject, map, shareReplay, switchMap } from 'rxjs';
import { getFormattedDate, reverseDate } from '../helpers/date.helper';
import { TimeEntryGroup } from '../models/time-entry-group.model';
import { parseTogglDescription } from '../helpers/toggl-description-parser.helper';
import { TimespanPipe } from '../pipes/timespan.pipe';
import { EXTENSION_MESSAGES } from '../../../core/constants/messages.constant';
import { ExtensionMessenger } from '../../../core/helpers/extension-messager.helper';
import { MessageBase } from '../../../core/models/messages/message-base.model';
import { FillTimeEntryRequest } from '../../../core/models/messages/fill-time-entry-request.model';
import { SettingsService } from './settings.service';
import { getRoundedTimespanSeconds } from '../helpers/timespan.helper';
import { parseTogglDescriptionSelctorToRegex } from '../helpers/toggl-description-selector-parser.helper';
import { GetSavedEntriesRequest } from '../../../core/models/messages/get-saved-entries-request.model';
import { SavedEntry } from '../../../core/models/saved-entry.model';
import { parseUrenregistratieTitleToPbi } from '../helpers/urenregistratie-title-parser.helper';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  private readonly _selectedDate$ = new BehaviorSubject<Date | null>(null);
  public readonly selectedDate$ = this._selectedDate$.asObservable();

  private readonly _savedEntries$ = new BehaviorSubject<SavedEntry[] | null>(
    null,
  );
  public readonly savedEntries$ = this._savedEntries$.pipe(
    map((entries) =>
      entries == null
        ? null
        : entries
            .map((entry) => {
              const parsedPbi = parseUrenregistratieTitleToPbi(entry.title);

              return parsedPbi == null
                ? null
                : {
                    pbi: parsedPbi,
                    description: entry.description,
                  };
            })
            .filter((x) => x !== null),
    ),
    shareReplay(1),
  );

  constructor(
    private readonly timespanPipe: TimespanPipe,
    private readonly settingsService: SettingsService,
  ) {
    this.initializeSelectedDate();
    this.initSelectedDateListener();
    this.initSavedEntriesListener();

    this._selectedDate$
      .pipe(
        takeUntilDestroyed(),
        switchMap((date) =>
          date == null
            ? Promise.resolve<SavedEntry[] | null>(null)
            : this.tryGetSavedEntries(date),
        ),
      )
      .subscribe((entries) => {
        this._savedEntries$.next(entries);
      });
  }

  private async initializeSelectedDate(): Promise<void> {
    try {
      const response = await ExtensionMessenger.sendMessageToContent<
        MessageBase,
        string
      >({
        type: EXTENSION_MESSAGES.POPUP_SOURCE.GET_SELECTED_DATE,
      });

      const date = this.parsePossibleDate(response);
      this._selectedDate$.next(date);
    } catch (error) {
      console.error('Error getting selected date from content script:', error);
    }
  }

  private initSelectedDateListener(): void {
    ExtensionMessenger.startListeningToMsg<
      { selectedDate: string | null } & MessageBase,
      void
    >(EXTENSION_MESSAGES.CONTENT_SOURCE.SELECTED_DATE_CHANGED, (message) => {
      const date = this.parsePossibleDate(message.selectedDate);
      this._selectedDate$.next(date);
    });
  }

  private parsePossibleDate(dateString: string | null): Date | null {
    return dateString ? new Date(reverseDate(dateString)) : null;
  }

  public async fillTimeEntryGroup(
    timeEntryGroup: TimeEntryGroup,
  ): Promise<void> {
    try {
      if (!timeEntryGroup.description) {
        console.warn('Time entry group description is null');
        return;
      }

      const selector =
        this.settingsService.currentSettings?.descriptionSelector;
      if (!selector) {
        console.warn('Description selector is not set in settings');
        return;
      }

      const parsedDescription = parseTogglDescription(
        timeEntryGroup.description,
        parseTogglDescriptionSelctorToRegex(selector),
      );

      if (!parsedDescription) {
        console.warn('Failed to parse description: ', parsedDescription);
        return;
      }

      const payload = {
        pbi: parsedDescription.pbi,
        description: parsedDescription.description,
        time: this.timespanPipe.transform(
          this.getSecondsAsRounded(timeEntryGroup.totalDuration),
          'HH:mm',
        ),
      };

      await ExtensionMessenger.sendMessageToContent<FillTimeEntryRequest, void>(
        {
          type: EXTENSION_MESSAGES.POPUP_SOURCE.FILL_TIME_ENTRY,
          payload,
        },
      );
    } catch (error) {
      console.error('Error filling time entry group in content script:', error);
    }
  }

  private getSecondsAsRounded(seconds: number): number {
    const roundingTime = this.settingsService.currentSettings?.roundingTime;
    const roundingDirection =
      this.settingsService.currentSettings?.roundingDirection;

    if (!roundingTime || !roundingDirection) {
      throw new Error('Rounding settings are not correctly configured');
    }

    return getRoundedTimespanSeconds(seconds, roundingTime, roundingDirection);
  }

  private async tryGetSavedEntries(date: Date): Promise<SavedEntry[] | null> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const entries = await ExtensionMessenger.sendMessageToContent<
        GetSavedEntriesRequest,
        SavedEntry[]
      >({
        type: EXTENSION_MESSAGES.POPUP_SOURCE.GET_SAVED_ENTRIES,
        payload: {
          date: reverseDate(getFormattedDate(date)),
        },
      });

      if (entries !== null) {
        return entries;
      }

      console.warn(
        `Attempt ${attempt + 1} to get saved entries failed, retrying...`,
      );

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return null;
  }

  private initSavedEntriesListener(): void {
    ExtensionMessenger.startListeningToMsg<
      { savedEntries: SavedEntry[] | null } & MessageBase,
      void
    >(EXTENSION_MESSAGES.CONTENT_SOURCE.SAVED_ENTRIES_CHANGED, (message) => {
      this._savedEntries$.next(message.savedEntries);
    });
  }
}
