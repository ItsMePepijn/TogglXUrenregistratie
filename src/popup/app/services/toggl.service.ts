import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/toggl/toggl-user.model';
import { getFormattedDate } from '../helpers/date.helper';
import { TimeEntry } from '../models/toggl/time-entry.model';

@Injectable({
  providedIn: 'root',
})
export class TogglService {
  private readonly apiUrl = 'https://api.toggl.com/api/v9';

  constructor(private readonly http: HttpClient) {}

  public getUserWithCredentials(
    emailOrToken: string,
    password?: string,
  ): Observable<User | null> {
    return this.http.get<User | null>(`${this.apiUrl}/me`, {
      headers: {
        Authorization: this.getAuthHeaderFromCredentials(
          emailOrToken,
          password,
        ),
      },
    });
  }

  public getTimeEntriesForDate(
    date: Date,
    token: string,
  ): Observable<TimeEntry[]> {
    const endDate = new Date(date);
    endDate.setDate(date.getDate() + 1);

    return this.http.get<TimeEntry[]>(
      `${this.apiUrl}/me/time_entries?meta=true`,
      {
        headers: {
          Authorization: this.getAuthHeaderFromCredentials(token),
        },
        params: {
          start_date: getFormattedDate(date),
          end_date: getFormattedDate(endDate),
        },
      },
    );
  }

  private getAuthHeaderFromCredentials(
    prefix: string,
    suffix: string = 'api_token',
  ): string {
    const credentials = btoa(`${prefix}:${suffix}`);
    return `Basic ${credentials}`;
  }
}
