import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Config } from '../models/config.model';
import { HttpClient } from '@angular/common/http';

const DEFAULT_CONFIG: Config = {
  version: 'LOCAL',
};

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private readonly _config$ = new BehaviorSubject<Config>(DEFAULT_CONFIG);
  public readonly config$ = this._config$.asObservable();
  public get currentConfig(): Config {
    return this._config$.value;
  }

  constructor(private readonly httpClient: HttpClient) {}

  public async loadConfig(): Promise<void> {
    const configUrl = chrome.runtime.getURL('config.json');
    try {
      const config = await firstValueFrom(
        this.httpClient.get<Config>(configUrl),
      );
      this._config$.next(config);
    } catch (error) {
      console.error('Error loading config:', error);
      this._config$.next(DEFAULT_CONFIG);
    }
  }
}
