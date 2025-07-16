import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  private readonly _selectedDate = new BehaviorSubject<string | null>(null);
  public readonly selectedDate$ = this._selectedDate.asObservable();

  constructor() {
    this.initializeSelectedDate();
  }

  private async initializeSelectedDate(): Promise<void> {
    try {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (tabs.length === 0) {
        console.error('No active tab found');
        return;
      }

      const { id } = tabs[0];
      if (!id) {
        console.error('Tab ID is undefined');
        return;
      }

      const response = await chrome.tabs.sendMessage(id, {
        type: 'getSelectedDate',
      });

      this._selectedDate.next(response?.selectedDate ?? null);
    } catch (error) {
      console.error('Error getting selected date from content script:', error);
    }
  }
}
