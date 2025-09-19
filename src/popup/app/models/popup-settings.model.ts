import { RoundingTime } from '../enums/rounding-time.enum';
import { RoundingDirection } from '../enums/rounding-direction.enum';

export interface PopupSettings {
  // General
  descriptionSelector: string;

  // Rounding
  roundingTime: RoundingTime;
  roundingDirection: RoundingDirection;
}
