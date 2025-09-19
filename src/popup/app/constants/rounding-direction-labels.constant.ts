import { RoundingDirection } from '../enums/rounding-direction.enum';

export const ROUNDING_DIRECTION_LABELS: { [key in RoundingDirection]: string } =
  {
    [RoundingDirection.Nearest]: 'Nearest',
    [RoundingDirection.Up]: 'Always up',
    [RoundingDirection.Down]: 'Always down',
  };
