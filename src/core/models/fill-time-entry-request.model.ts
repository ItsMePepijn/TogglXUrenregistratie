import { MessageBase } from './message-base.model';

export interface FillTimeEntryRequest extends MessageBase {
  payload: FillTimeEntryRequestPayload;
}

export interface FillTimeEntryRequestPayload {
  pbiNumber: string;
  description: string;
  time: string;
}
