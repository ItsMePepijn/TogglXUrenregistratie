export interface TimeEntry {
  id: number;
  workspace_id: number;
  project_id: number;
  task_id: number | null;
  billable: boolean;
  start: string;
  stop: string | null;
  duration: number;
  description: string | null;
  tags: string[];
  tag_ids: number[];
  duronly: boolean;
  at: string;
  server_deleted_at: string | null;
  user_id: number;
  uid: number;
  wid: number;
  pid: number;
}
