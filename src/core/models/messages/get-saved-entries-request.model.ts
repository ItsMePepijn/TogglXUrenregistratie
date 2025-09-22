import { MessageBase } from './message-base.model';

export interface GetSavedEntriesRequest extends MessageBase {
  payload: GetSavedEntriesRequestPayload;
}

export interface GetSavedEntriesRequestPayload {
  date: string;
}
