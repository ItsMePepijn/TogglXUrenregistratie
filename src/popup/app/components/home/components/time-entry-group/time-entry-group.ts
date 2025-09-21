import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, Input, OnInit } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { BehaviorSubject, combineLatestWith, filter, map } from 'rxjs';
import { TimespanPipe } from '../../../../pipes/timespan.pipe';
import { TimeEntryGroup } from '../../../../models/time-entry-group.model';
import { ContentService } from '../../../../services/content.service';
import { ButtonModule } from 'primeng/button';
import { parseDescription } from '../../../../helpers/description-parser.helper';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SettingsService } from '../../../../services/settings.service';
import { parseDescriptionSelectrorToRegex } from '../../../../helpers/description-selector-parser';

@Component({
  selector: 'app-time-entry-group',
  imports: [
    AccordionModule,
    BadgeModule,
    AsyncPipe,
    TimespanPipe,
    ButtonModule,
  ],
  templateUrl: './time-entry-group.html',
  styleUrl: './time-entry-group.scss',
})
export class TimeEntryGroupComponent implements OnInit {
  protected readonly group$ = new BehaviorSubject<TimeEntryGroup | null>(null);
  @Input({ required: true }) set group(value: TimeEntryGroup) {
    this.group$.next(value);
  }

  @Input({ required: true }) index!: number;

  protected readonly _groupIsInValid$ = new BehaviorSubject<boolean>(false);
  protected readonly groupIsInValid$ = this._groupIsInValid$.asObservable();

  constructor(
    protected readonly contentService: ContentService,
    protected readonly settingsService: SettingsService,
    private readonly destroyRef: DestroyRef,
  ) {}

  public ngOnInit(): void {
    this.group$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        combineLatestWith(this.settingsService.settings$),
        filter(([group, settings]) => group != null && settings != null),
        map(([group, settings]) =>
          group?.description == null
            ? true
            : parseDescription(
                group.description,
                parseDescriptionSelectrorToRegex(settings!.descriptionSelector),
              ) == null,
        ),
      )
      .subscribe((isInValid) => this._groupIsInValid$.next(isInValid));
  }

  protected async handleSave(
    event: Event,
    group: TimeEntryGroup,
  ): Promise<void> {
    event.stopPropagation();

    await this.contentService.fillTimeEntryGroup(group);
  }
}
