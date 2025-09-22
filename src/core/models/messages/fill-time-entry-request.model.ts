import { MessageBase } from './message-base.model';

export interface FillTimeEntryRequest extends MessageBase {
  payload: FillTimeEntryRequestPayload;
}

export interface FillTimeEntryRequestPayload {
  pbi: string;
  description: string;
  time: string;
}
