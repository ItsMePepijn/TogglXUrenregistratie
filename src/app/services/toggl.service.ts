import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TogglUser } from '../models/toggl-user.model';
import { getFormattedDate } from '../helpers/date.helper';

@Injectable({
  providedIn: 'root',
})
export class TogglService {
  private readonly apiUrl = 'https://api.toggl.com/api/v9';

  constructor(private readonly http: HttpClient) {}

  public getUserWithCredentials(
    email: string,
    password: string
  ): Observable<TogglUser | null> {
    return this.http.get<TogglUser | null>(`${this.apiUrl}/me`, {
      headers: {
        Authorization: this.getAuthHeaderFromCredentials(email, password),
      },
    });
  }

  ///
  /// TODO: Return type
  ///
  public getTimeEntriesForDate(date: Date, token: string): Observable<any[]> {
    const endDate = new Date(date);
    endDate.setDate(date.getDate() + 1);

    return this.http.get<any[]>(`${this.apiUrl}/me/time_entries`, {
      headers: {
        Authorization: this.getAuthHeaderFromCredentials(token),
      },
      params: {
        start_date: getFormattedDate(date),
        end_date: getFormattedDate(endDate),
      },
    });
  }

  private getAuthHeaderFromCredentials(
    prefix: string,
    suffix: string = 'api_token'
  ): string {
    const credentials = btoa(`${prefix}:${suffix}`);
    return `Basic ${credentials}`;
  }
}
