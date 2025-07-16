import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { reverseDate } from '../helpers/date.helper';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  private readonly _selectedDate = new BehaviorSubject<Date | null>(null);
  public readonly selectedDate$ = this._selectedDate.asObservable();

  constructor() {
    this.initializeSelectedDate();
    this.initSelectedDateListener();
  }

  ///
  /// TODO: opschonen
  ///
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

      const date = response.selectedDate
        ? new Date(reverseDate(response.selectedDate))
        : null;

      this._selectedDate.next(date);
    } catch (error) {
      console.error('Error getting selected date from content script:', error);
    }
  }

  ///
  /// TODO: opschonen
  ///
  private async initSelectedDateListener(): Promise<void> {
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
      chrome.runtime.onMessage.addListener((message: any) => {
        if (message.type === 'selectedDateChanged') {
          const date = message.selectedDate
            ? new Date(reverseDate(message.selectedDate))
            : null;
          this._selectedDate.next(date);
        }
      });
    } catch (error) {
      console.error('Error initializing selected date listener:', error);
    }
  }
}
