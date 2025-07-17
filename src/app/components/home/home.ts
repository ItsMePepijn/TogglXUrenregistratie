import { Component, DestroyRef, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { ContentService } from '../../services/content.service';
import { AsyncPipe, DatePipe } from '@angular/common';
import {
  BehaviorSubject,
  filter,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SkeletonModule } from 'primeng/skeleton';
import { TimeEntry } from '../../models/toggl/time-entry.model';
import { TimespanPipe } from '../../pipes/timespan.pipe';
import { PanelMenu } from 'primeng/panelmenu';
import { Accordion, AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';

interface TimeEntryGroup {
  description: string | null;
  projectName?: string;
  projectColor?: string;
  totalDuration: number;
  entries: TimeEntry[];
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
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly _items$ = new BehaviorSubject<TimeEntry[] | null>(null);
  protected readonly items$: Observable<TimeEntryGroup[] | null> =
    this._items$.pipe(map(this.mapItemsToGroups));
  protected readonly totalDuration$: Observable<number | null> =
    this._items$.pipe(
      map((items) => {
        if (!items) {
          return null;
        }
        return items.reduce((total, entry) => total + entry.duration, 0);
      }),
    );

  protected readonly isLoading$ = new BehaviorSubject<boolean>(false);
  protected readonly error$ = new BehaviorSubject<string | null>(null);

  constructor(
    protected readonly contentService: ContentService,
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly destroyRef: DestroyRef,
  ) {}

  public ngOnInit(): void {
    this.contentService.selectedDate$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => {
          this.isLoading$.next(true);
        }),
        switchMap((selectedDate) => {
          if (!selectedDate) {
            return of(null);
          }

          return this.userService.getMyTimeEntriesForDate(selectedDate);
        }),
        filter((result) => result !== null),
      )
      .subscribe((result) => {
        this.isLoading$.next(false);
        if (result.success) {
          this._items$.next(result.entries);
        } else {
          this._items$.next(null);
          if (result.error) {
            this.error$.next(result.error);
          }
        }
      });
  }

  protected logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  private mapItemsToGroups(items: TimeEntry[] | null): TimeEntryGroup[] | null {
    if (!items) {
      return null;
    }

    var sorted = items.sort((a, b) => {
      return new Date(b.start).getTime() - new Date(a.start).getTime();
    });

    const grouped: TimeEntryGroup[] = [];
    sorted.forEach((entry) => {
      const existingGroup = grouped.find(
        (group) => group.description === entry.description,
      );

      if (existingGroup) {
        existingGroup.totalDuration += entry.duration;
        existingGroup.entries.push(entry);
      } else {
        grouped.push({
          description: entry.description,
          totalDuration: entry.duration,
          projectName: entry.project_name,
          projectColor: entry.project_color,
          entries: [entry],
        });
      }
    });
    return grouped;
  }
}
