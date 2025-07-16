import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { TogglUser } from '../models/toggl-user.model';
import { TogglService } from './toggl.service';

const USER_STORAGE_KEY = 'togglUser';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly _user$ = new BehaviorSubject<TogglUser | null>(null);

  public readonly user$ = this._user$.asObservable();
  public readonly isLoggedIn$ = this._user$.pipe(map((user) => user !== null));

  constructor(private readonly togglService: TogglService) {}

  public login(
    email: string,
    password: string
  ): Observable<{ success: true } | { error: string; success: false }> {
    return this.togglService.getUserWithCredentials(email, password).pipe(
      tap((user) => {
        this._user$.next(user);
        if (user) {
          this.saveUserToStorage(user);
        }
      }),
      map(() => ({ success: true as const })),
      catchError((error) => {
        return of({
          error: error.error || 'Unknown error occurred',
          success: false,
        });
      })
    );
  }

  public logout(): void {
    this._user$.next(null);
    chrome.storage.local.remove([USER_STORAGE_KEY], () => {
      if (chrome.runtime.lastError) {
        console.error(
          'Error removing user from storage:',
          chrome.runtime.lastError
        );
      }
    });
  }

  public loadUserFromStorage(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.get([USER_STORAGE_KEY], (result) => {
        if (chrome.runtime.lastError) {
          console.error(
            'Error loading user from storage:',
            chrome.runtime.lastError
          );
          this._user$.next(null);
        } else {
          const user = result[USER_STORAGE_KEY] || null;
          this._user$.next(user);
        }
        resolve();
      });
    });
  }

  ///
  /// TODO: Return type
  ///
  public getMyTimeEntriesForDate(
    date: Date
  ): Observable<
    | { success: true; entries: any[]; error: null }
    | { success: false; entries: null; error: string }
  > {
    return this.user$.pipe(
      switchMap((user) => {
        const token = user?.api_token;
        if (!token) {
          return of({
            success: false as const,
            entries: null,
            error: 'Not logged in',
          });
        }
        return this.togglService.getTimeEntriesForDate(date, token).pipe(
          map((entries) => ({
            success: true as const,
            entries: entries || [],
            error: null,
          })),
          catchError((error) => {
            return of({
              success: false as const,
              entries: null,
              error: error.error || 'Unknown error occurred',
            });
          })
        );
      })
    );
  }

  private saveUserToStorage(user: TogglUser): void {
    chrome.storage.local.set({ [USER_STORAGE_KEY]: user }, () => {
      if (chrome.runtime.lastError) {
        console.error(
          'Error saving user to storage:',
          chrome.runtime.lastError
        );
      }
    });
  }
}
