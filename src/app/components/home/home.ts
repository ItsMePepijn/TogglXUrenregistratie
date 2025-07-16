import { Component, DestroyRef, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { ContentService } from '../../services/content.service';
import { AsyncPipe, DatePipe } from '@angular/common';
import { BehaviorSubject, filter, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home',
  imports: [AsyncPipe, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  protected readonly items$ = new BehaviorSubject<any[] | null>(null);

  constructor(
    protected readonly contentService: ContentService,
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly destroyRef: DestroyRef
  ) {}

  ///
  /// TODO: Loading/error handling
  ///
  public ngOnInit(): void {
    this.contentService.selectedDate$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((selectedDate) => {
          if (!selectedDate) {
            return of(null);
          }

          return this.userService.getMyTimeEntriesForDate(selectedDate);
        }),
        filter((result) => result !== null)
      )
      .subscribe((result) => {
        if (result.success) {
          this.items$.next(result.entries);
        } else {
          this.items$.next(null);
          if (result.error) {
            console.error('Error fetching time entries:', result.error);
          }
        }
      });
  }

  protected logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
