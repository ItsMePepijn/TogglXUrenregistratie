import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, Input, OnInit } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { BehaviorSubject, combineLatest, filter, map, Observable } from 'rxjs';
import { TimespanPipe } from '../../../../pipes/timespan.pipe';
import { TimeEntryGroup } from '../../../../models/time-entry-group.model';
import { ContentService } from '../../../../services/content.service';
import { ButtonModule } from 'primeng/button';
import { parseTogglDescription } from '../../../../helpers/toggl-description-parser.helper';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SettingsService } from '../../../../services/settings.service';
import { parseTogglDescriptionSelctorToRegex } from '../../../../helpers/toggl-description-selector-parser.helper';
import { MessageService, PrimeIcons } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

interface Vm {
  group: TimeEntryGroup | null;
  groupIsValid: boolean;
  isSaved: boolean;
}

@Component({
  selector: 'app-time-entry-group',
  imports: [
    AccordionModule,
    BadgeModule,
    AsyncPipe,
    TimespanPipe,
    ButtonModule,
    TooltipModule,
  ],
  templateUrl: './time-entry-group.html',
  styleUrl: './time-entry-group.scss',
})
export class TimeEntryGroupComponent implements OnInit {
  @Input({ required: true }) set group(value: TimeEntryGroup) {
    this._group$.next(value);
  }
  @Input({ required: true }) index!: number;

  private readonly _group$ = new BehaviorSubject<TimeEntryGroup | null>(null);
  private readonly _groupIsValid$ = new BehaviorSubject<boolean>(false);
  private readonly _isSaved$ = new BehaviorSubject<boolean>(false);

  protected readonly Vm$: Observable<Vm> = combineLatest({
    group: this._group$,
    groupIsValid: this._groupIsValid$,
    isSaved: this._isSaved$,
  });

  constructor(
    protected readonly contentService: ContentService,
    protected readonly settingsService: SettingsService,
    private readonly destroyRef: DestroyRef,
    private readonly messageService: MessageService,
  ) {}

  public ngOnInit(): void {
    combineLatest([
      this._group$,
      this.settingsService.settings$,
      this.contentService.savedEntries$,
    ])
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(([group, settings]) => group != null && settings != null),
        map(([group, settings, savedEntries]) => {
          const parsedDescription =
            group?.description == null
              ? null
              : parseTogglDescription(
                  group.description,
                  parseTogglDescriptionSelctorToRegex(
                    settings!.descriptionSelector,
                  ),
                );

          const isSaved =
            parsedDescription != null &&
            savedEntries != null &&
            savedEntries.find(
              (entry) =>
                entry.description === parsedDescription.description &&
                entry.pbi === parsedDescription.pbi,
            ) != null;

          return {
            isValid: parsedDescription != null,
            isSaved,
          };
        }),
      )
      .subscribe(({ isValid, isSaved }) => {
        this._groupIsValid$.next(isValid);
        this._isSaved$.next(isSaved);
      });
  }

  protected async handleSave(
    event: Event,
    group: TimeEntryGroup,
  ): Promise<void> {
    event.stopPropagation();

    const result = await this.contentService.fillTimeEntryGroup(group);
    if (!result.success) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: result.errorMessage,
        life: 4000,
      });
    }
  }

  protected readonly PrimeIcons = PrimeIcons;
}
