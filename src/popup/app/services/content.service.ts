import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { reverseDate } from '../helpers/date.helper';
import { TimeEntryGroup } from '../models/time-entry-group.model';
import { parseDescription } from '../helpers/description-parser.helper';
import { TimespanPipe } from '../pipes/timespan.pipe';
import { EXTENSION_MESSAGES } from '../../../core/constants/messages.constant';
import { ExtensionMessenger } from '../../../core/helpers/extension-messager.helper';
import { MessageBase } from '../../../core/models/message-base.model';
import { FillTimeEntryRequest } from '../../../core/models/fill-time-entry-request.model';
import { SettingsService } from './settings.service';
import { DESCRIPTION_SELECTOR_TOKENS } from '../constants/description-selector.constant';
import { getRoundedTimespanSeconds } from '../helpers/timespan.helper';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  private readonly _selectedDate = new BehaviorSubject<Date | null>(null);
  public readonly selectedDate$ = this._selectedDate.asObservable();

  constructor(
    private readonly timespanPipe: TimespanPipe,
    private readonly settingsService: SettingsService,
  ) {
    this.initializeSelectedDate();
    this.initSelectedDateListener();
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
      this._selectedDate.next(date);
    } catch (error) {
      console.error('Error getting selected date from content script:', error);
    }
  }

  private initSelectedDateListener(): void {
    ExtensionMessenger.startListeningToMsg<
      { selectedDate: string | null } & MessageBase
    >(EXTENSION_MESSAGES.CONTENT_SOURCE.SELECTED_DATE_CHANGED, (message) => {
      const date = this.parsePossibleDate(message.selectedDate);
      this._selectedDate.next(date);
    });
  }

  private parsePossibleDate(dateString: string | null): Date | null {
    return dateString ? new Date(reverseDate(dateString)) : null;
  }

  public async fillTimeEntryGroup(
    timeEntryGroup: TimeEntryGroup,
  ): Promise<void> {
    try {
      const parsedDescription = parseDescription(
        timeEntryGroup.description,
        this.getConfiguredDescriptionSelectorAsRegex(),
      );

      if (!parsedDescription?.pbiNumber || !parsedDescription?.description) {
        console.warn('Parsed description is incomplete:', parsedDescription);
        return;
      }

      const payload = {
        pbiNumber: parsedDescription.pbiNumber,
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

  private getConfiguredDescriptionSelectorAsRegex(): RegExp {
    let selector = this.settingsService.currentSettings?.descriptionSelector;
    if (!selector) {
      throw new Error('Description selector is not configured');
    }

    selector = selector.replace(DESCRIPTION_SELECTOR_TOKENS.PBI, '(\\d+)');
    selector = selector.replace(
      DESCRIPTION_SELECTOR_TOKENS.DESCRIPTION,
      '(.*)',
    );

    return new RegExp(selector);
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
}
