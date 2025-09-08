import { AsyncPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { BehaviorSubject } from 'rxjs';
import { TimespanPipe } from '../../../../pipes/timespan.pipe';
import { TimeEntryGroup } from '../../../../models/time-entry-group.model';
import { ContentService } from '../../../../services/content.service';

@Component({
  selector: 'app-time-entry-group',
  imports: [AccordionModule, BadgeModule, AsyncPipe, TimespanPipe],
  templateUrl: './time-entry-group.html',
  styleUrl: './time-entry-group.scss',
})
export class TimeEntryGroupComponent {
  protected readonly group$ = new BehaviorSubject<TimeEntryGroup | null>(null);
  @Input({ required: true }) set group(value: TimeEntryGroup) {
    this.group$.next(value);
  }

  @Input({ required: true }) index!: number;

  constructor(protected readonly contentService: ContentService) {}
}
