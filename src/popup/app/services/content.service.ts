import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { reverseDate } from '../helpers/date.helper';
import { TimeEntryGroup } from '../models/time-entry-group.model';
import { parseDescription } from '../helpers/description-parser.helper';
import { TimespanPipe } from '../pipes/timespan.pipe';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  private readonly _selectedDate = new BehaviorSubject<Date | null>(null);
  public readonly selectedDate$ = this._selectedDate.asObservable();

  private readonly descriptionRegex = /(\d+) - (.*)/;

  constructor(private readonly timespanPipe: TimespanPipe) {
    this.initializeSelectedDate();
    this.initSelectedDateListener();
  }

  private async initializeSelectedDate(): Promise<void> {
    try {
      const activeTabId = await this.getActiveTabId();
      if (activeTabId === null) {
        console.warn('No active tab found to get selected date.');
        return;
      }

      const response = await chrome.tabs.sendMessage(activeTabId, {
        type: 'getSelectedDate',
      });

      const date = this.parsePossibleDate(response.selectedDate);
      this._selectedDate.next(date);
    } catch (error) {
      console.error('Error getting selected date from content script:', error);
    }
  }

  private initSelectedDateListener(): void {
    try {
      chrome.runtime.onMessage.addListener((message: any) => {
        if (message.type === 'selectedDateChanged') {
          const date = this.parsePossibleDate(message.selectedDate);
          this._selectedDate.next(date);
        }
      });
    } catch (error) {
      console.error('Error initializing selected date listener:', error);
    }
  }

  private parsePossibleDate(dateString: any): Date | null {
    return dateString ? new Date(reverseDate(dateString)) : null;
  }

  private async getActiveTabId(): Promise<number | null> {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tabs.length === 0) {
      return null;
    }

    const { id } = tabs[0];
    return id ?? null;
  }

  public async fillTimeEntryGroup(
    timeEntryGroup: TimeEntryGroup,
  ): Promise<void> {
    try {
      const activeTabId = await this.getActiveTabId();
      if (activeTabId === null) {
        console.warn('No active tab found to fill time entry.');
        return;
      }

      const parsedDescription = parseDescription(
        timeEntryGroup.description,
        this.descriptionRegex,
      );

      if (!parsedDescription?.pbiNumber || !parsedDescription?.description) {
        console.warn('Parsed description is incomplete:', parsedDescription);
        return;
      }

      const payload = {
        pbiNumber: parsedDescription.pbiNumber,
        description: parsedDescription.description,
        time: this.timespanPipe.transform(
          timeEntryGroup.totalDuration,
          'HH:mm',
        ),
      };

      chrome.tabs.sendMessage(activeTabId, {
        type: 'fillTimeEntry',
        payload,
      });
    } catch (error) {
      console.error('Error filling time entry group in content script:', error);
    }
  }
}
