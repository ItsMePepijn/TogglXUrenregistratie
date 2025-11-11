import { Component, DestroyRef, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ContentService } from '../../services/content.service';
import { AsyncPipe, DatePipe } from '@angular/common';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  switchMap,
  tap,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SkeletonModule } from 'primeng/skeleton';
import { TimeEntry } from '../../models/toggl/time-entry.model';
import { TimespanPipe } from '../../pipes/timespan.pipe';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import {
  TimeEntryGroup,
  TimeEntryGroupImpl,
} from '../../models/time-entry-group.model';
import { TimeEntryGroupComponent } from './components/time-entry-group/time-entry-group';
import { Message } from './components/message/message';
import { PrimeIcons } from 'primeng/api';

interface Vm {
  groups: TimeEntryGroup[] | null;
  totalDuration: number | null;
  selectedDate: Date | null;
  isLoading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-home',
  imports: [
    AsyncPipe,
    DatePipe,
    SkeletonModule,
    TimespanPipe,
    AccordionModule,
    BadgeModule,
    TimeEntryGroupComponent,
    Message,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly _timeEntries$ = new BehaviorSubject<TimeEntry[] | null>(
    null,
  );
  private readonly _selectedDate$ = new BehaviorSubject<Date | null>(null);
  private readonly _isLoading$ = new BehaviorSubject<boolean>(true);
  private readonly _error$ = new BehaviorSubject<string | null>(null);

  protected readonly Vm$: Observable<Vm> = combineLatest({
    groups: this._timeEntries$.pipe(map(this.mapItemsToGroups)),
    totalDuration: this._timeEntries$.pipe(map(this.mapItemsToTotalDuration)),
    selectedDate: this._selectedDate$,
    isLoading: this._isLoading$,
    error: this._error$,
  });

  constructor(
    protected readonly contentService: ContentService,
    private readonly userService: UserService,
    private readonly destroyRef: DestroyRef,
  ) {}

  public ngOnInit(): void {
    this.contentService.selectedDate$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        distinctUntilChanged(),
        debounceTime(50),
        tap((date) => {
          if (date == null) {
            this._isLoading$.next(false);
          }
        }),
        filter((date) => date !== null),
        tap(() => {
          this._isLoading$.next(true);
        }),
        switchMap((selectedDate) => {
          return this.userService.getMyTimeEntriesForDate(selectedDate);
        }),
        filter((result) => result !== null),
      )
      .subscribe((result) => {
        this._isLoading$.next(false);
        if (result.success) {
          this._timeEntries$.next(result.entries);
        } else {
          this._timeEntries$.next(null);
          if (result.error) {
            this._error$.next(result.error);
          }
        }
      });

    this.contentService.selectedDate$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((selectedDate) => {
        this._selectedDate$.next(selectedDate);
      });
  }

  private mapItemsToGroups(items: TimeEntry[] | null): TimeEntryGroup[] | null {
    if (!items) {
      return null;
    }

    var sorted = items
      .filter((entry) => entry.duration > 0)
      .sort((a, b) => {
        return new Date(b.start).getTime() - new Date(a.start).getTime();
      });

    const grouped: TimeEntryGroup[] = [];
    sorted.forEach((entry) => {
      const existingGroup = grouped.find(
        (group) => group.description === entry.description,
      );

      if (existingGroup) {
        existingGroup.entries.push(entry);
      } else {
        grouped.push(
          new TimeEntryGroupImpl(
            entry.description,
            [entry],
            entry.project_name,
            entry.project_color,
          ),
        );
      }
    });
    return grouped;
  }

  private mapItemsToTotalDuration(items: TimeEntry[] | null): number | null {
    return items == null
      ? null
      : items.reduce((total, entry) => total + entry.duration, 0);
  }

  protected readonly PrimeIcons = PrimeIcons;
}
