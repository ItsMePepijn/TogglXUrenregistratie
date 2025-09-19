import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PopupSettings } from '../models/popup-settings.model';
import { RoundingTime } from '../enums/rounding-time.enum';
import { RoundingDirection } from '../enums/rounding-direction.enum';

const DEFAULT_SETTINGS: PopupSettings = {
  // General
  descriptionSelector: '{pbi} - {description}',

  // Rounding
  roundingTime: RoundingTime.FiveMinutes,
  roundingDirection: RoundingDirection.Nearest,
};

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly SETTINGS_STORAGE_KEY = 'popupSettings';

  private readonly _settings$ = new BehaviorSubject<PopupSettings | null>(null);
  public readonly settings$ = this._settings$.asObservable();
  public get currentSettings(): PopupSettings | null {
    return this._settings$.value;
  }

  constructor() {
    this.loadSettingsFromStorage();
  }

  public updateSettings(settings: PopupSettings): void {
    this._settings$.next(settings);
    this.saveSettingsToStorage(settings);
  }

  private loadSettingsFromStorage(): void {
    chrome.storage.local.get([this.SETTINGS_STORAGE_KEY], (result) => {
      if (chrome.runtime.lastError) {
        console.error(
          'Error loading settings from storage:',
          chrome.runtime.lastError,
        );
        return;
      }

      const storedSettings = result[this.SETTINGS_STORAGE_KEY];
      const settings = storedSettings
        ? { ...DEFAULT_SETTINGS, ...storedSettings }
        : DEFAULT_SETTINGS;

      this._settings$.next(settings || null);

      if (!storedSettings) {
        this.saveSettingsToStorage(settings);
      }
    });
  }

  private saveSettingsToStorage(settings: PopupSettings): void {
    chrome.storage.local.set({ [this.SETTINGS_STORAGE_KEY]: settings }, () => {
      if (chrome.runtime.lastError) {
        console.error(
          'Error saving settings to storage:',
          chrome.runtime.lastError,
        );
      }
    });
  }
}
