import { Component, DestroyRef, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { ContentService } from '../../services/content.service';
import { AsyncPipe, DatePipe } from '@angular/common';
import { BehaviorSubject, filter, of, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SkeletonModule } from 'primeng/skeleton';
import { TimeEntry } from '../../models/toggl/time-entry.model';

@Component({
  selector: 'app-home',
  imports: [AsyncPipe, DatePipe, SkeletonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  protected readonly items$ = new BehaviorSubject<TimeEntry[] | null>(null);
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
          this.items$.next(result.entries);
        } else {
          this.items$.next(null);
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
}
