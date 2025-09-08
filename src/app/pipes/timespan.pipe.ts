import { Pipe, PipeTransform } from '@angular/core';
import { getTimespanForSeconds } from '../helpers/timespan.helper';

@Pipe({
  name: 'timespan',
})
export class TimespanPipe implements PipeTransform {
  transform(value: number, format: 'HH:mm:ss' | 'HH:mm'): string {
    const { hours, minutes, seconds } = getTimespanForSeconds(value);

    const formattedMinutes = minutes.toString().padStart(2, '0');

    if (format === 'HH:mm') {
      return `${hours}:${formattedMinutes}`;
    }

    const formattedSeconds = seconds.toString().padStart(2, '0');

    return `${hours}:${formattedMinutes}:${formattedSeconds}`;
  }
}
