import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TogglUser } from '../models/toggl-user.model';

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

  private getAuthHeaderFromCredentials(
    email: string,
    password: string
  ): string {
    const credentials = btoa(`${email}:${password}`);
    return `Basic ${credentials}`;
  }
}
