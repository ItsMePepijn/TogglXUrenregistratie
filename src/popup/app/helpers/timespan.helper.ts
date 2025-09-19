import { RoundingDirection } from '../enums/rounding-direction.enum';
import { RoundingTime } from '../enums/rounding-time.enum';

export function getTimespanForSeconds(seconds: number): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return { hours, minutes, seconds: remainingSeconds };
}

export function getRoundedTimespanSeconds(
  seconds: number,
  roundingTime: RoundingTime,
  roundingDirection: RoundingDirection,
): number {
  let roundingInterval: number;
  switch (roundingTime) {
    case RoundingTime.Minute:
      roundingInterval = 60;
      break;
    case RoundingTime.FiveMinutes:
      roundingInterval = 300;
      break;
    case RoundingTime.TenMinutes:
      roundingInterval = 600;
      break;
  }

  let secondsRounded: number;
  switch (roundingDirection) {
    case RoundingDirection.Nearest:
      secondsRounded =
        Math.round(seconds / roundingInterval) * roundingInterval;
      break;
    case RoundingDirection.Up:
      secondsRounded = Math.ceil(seconds / roundingInterval) * roundingInterval;
      break;
    case RoundingDirection.Down:
      secondsRounded =
        Math.floor(seconds / roundingInterval) * roundingInterval;
      break;
  }

  return secondsRounded;
}
