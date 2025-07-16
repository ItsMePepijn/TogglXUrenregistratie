import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
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
  ): Observable<{ error: string; success: false } | { success: true }> {
    return this.togglService.getUserWithCredentials(email, password).pipe(
      tap((user) => {
        this._user$.next(user);
        if (user) {
          this.saveUserToStorage(user);
        }
      }),
      catchError((error) => {
        return of({ error: error.error, success: false });
      }),
      map(() => ({ success: true }))
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
