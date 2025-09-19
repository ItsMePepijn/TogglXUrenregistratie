import { RoundingTime } from '../enums/rounding-time.enum';

export const ROUNDING_TIME_LABELS: { [key in RoundingTime]: string } = {
  [RoundingTime.Minute]: '1 Minute',
  [RoundingTime.FiveMinutes]: '5 Minutes',
  [RoundingTime.TenMinutes]: '10 Minutes',
};
