import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, Input, OnInit } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import {
  BehaviorSubject,
  combineLatest,
  combineLatestWith,
  filter,
  map,
  Observable,
} from 'rxjs';
import { TimespanPipe } from '../../../../pipes/timespan.pipe';
import { TimeEntryGroup } from '../../../../models/time-entry-group.model';
import { ContentService } from '../../../../services/content.service';
import { ButtonModule } from 'primeng/button';
import { parseDescription } from '../../../../helpers/description-parser.helper';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SettingsService } from '../../../../services/settings.service';
import { parseDescriptionSelectrorToRegex } from '../../../../helpers/description-selector-parser';
import { PrimeIcons } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

interface Vm {
  group: TimeEntryGroup | null;
  groupIsValid: boolean;
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

  protected readonly Vm$: Observable<Vm> = combineLatest({
    group: this._group$,
    groupIsValid: this._groupIsValid$,
  });

  constructor(
    protected readonly contentService: ContentService,
    protected readonly settingsService: SettingsService,
    private readonly destroyRef: DestroyRef,
  ) {}

  public ngOnInit(): void {
    this._group$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        combineLatestWith(this.settingsService.settings$),
        filter(([group, settings]) => group != null && settings != null),
        map(([group, settings]) =>
          group?.description == null
            ? false
            : parseDescription(
                group.description,
                parseDescriptionSelectrorToRegex(settings!.descriptionSelector),
              ) != null,
        ),
      )
      .subscribe((isValid) => this._groupIsValid$.next(isValid));
  }

  protected async handleSave(
    event: Event,
    group: TimeEntryGroup,
  ): Promise<void> {
    event.stopPropagation();

    await this.contentService.fillTimeEntryGroup(group);
  }

  protected readonly PrimeIcons = PrimeIcons;
}
