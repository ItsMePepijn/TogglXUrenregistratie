import { TimeEntry } from './toggl/time-entry.model';

export interface TimeEntryGroup {
  description: string | null;
  projectName: string | undefined;
  projectColor: string | undefined;
  entries: TimeEntry[];
  get totalDuration(): number;
}

export class TimeEntryGroupImpl implements TimeEntryGroup {
  public description: string | null;
  public projectName: string | undefined;
  public projectColor: string | undefined;
  public entries: TimeEntry[];

  public get totalDuration(): number {
    return this.entries.reduce((total, entry) => total + entry.duration, 0);
  }

  public constructor(
    description: string | null,
    entries: TimeEntry[],
    projectName?: string,
    projectColor?: string,
  ) {
    this.description = description;
    this.entries = entries;
    this.projectName = projectName;
    this.projectColor = projectColor;
  }
}
