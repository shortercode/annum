import { Duration } from './Duration';
import { TemporalUnit } from './TemporalUnit.constants';

export class Instant {
  constructor (readonly value: number, readonly offset: Duration = Duration.ZERO) {}

  add (delta: Duration): Instant {
    const result = new Date(this.value);
    switch (delta.units) {
      case TemporalUnit.MILLISECONDS:
        result.setTime(result.getTime() + Math.round(delta.value));
        break;
      case TemporalUnit.SECONDS:
        result.setSeconds(result.getSeconds() + Math.round(delta.value));
        break;
      case TemporalUnit.MINUTES:
        result.setMinutes(result.getMinutes() + Math.round(delta.value));
        break;
      case TemporalUnit.HOURS:
        result.setHours(result.getHours() + Math.round(delta.value));
        break;
      case TemporalUnit.DAYS:
        result.setDate(result.getDate() + Math.round(delta.value));
        break;
      case TemporalUnit.WEEKS:
        result.setDate(result.getDate() + Math.round(delta.days));
        break;
      case TemporalUnit.MONTHS:
        result.setMonth(result.getMonth() + Math.round(delta.value));
        break;
      case TemporalUnit.YEARS:
        result.setFullYear(result.getFullYear() + Math.round(delta.value));
        break;
    }
    return new Instant(result.getTime(), this.offset);
  }

  change_offset (offset: Duration = Duration.ZERO): Instant {
    const value = this.value - this.offset.milliseconds + offset.milliseconds;
    return new Instant(value, offset);
  }

  subtract (delta: Duration): Instant {
    return this.add(delta.negate());
  }

  format (locales?: string | string[], options?: Intl.DateTimeFormatOptions) {
    const formatter = new Intl.DateTimeFormat(locales, options);
    return formatter.format(this.as_date());
  }

  is_before(instant: Instant) {
    return this.unix < instant.unix;
  }

  is_after(instant: Instant) {
    return this.unix > instant.unix;
  }

  as_date(): Date {
    const utc = this.unix;
    const date = new Date();
    date.setTime(utc);
    return date;
  }

  get unix(): number {
    return this.value - this.offset.milliseconds;
  }

  static Now (): Instant {
    return this.FromDate(new Date());
  }

  static FromDate (date: Date): Instant {
    // NOTE +ve timezone has a -ve offset
    const offset = Duration.Minutes(-date.getTimezoneOffset());
    // NOTE time is always UTC
    const time = date.getTime();

    return new Instant(time + offset.milliseconds, offset);
  }

  static LocalOffset (): Duration<TemporalUnit.MINUTES> {
    const now = new Date();
    // NOTE +ve timezone has a -ve offset
    return Duration.Minutes(-now.getTimezoneOffset());
  }

  /**
   * 2018-04-04T16:00:00.000Z
   *  2018-04-04T16:00:00.000+02:00
   *  2018-04-04 16:00
   * 
   *  /(\d{4}-\d{2}-\d{2})?( |T\d{2}:\d{2}(?:\{2})/
   */

  static Parse (value: string): Instant {
    const date_match = value.match(/^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/);

    const result = {
      year: 1970, month: 1, day: 1,
      hour: 0, minute: 0, second: 0, millisecond: 0,
      offset: 0,
    };

    if (!date_match?.groups) {
      throw new Error(`Invalid datetime format "${value}"`);
    }

    const { year, month, day } = date_match.groups;
    result.year = +year!;
    result.month = +month!;
    result.day = +day!;

    value = value.slice(10);

    const time_match = value.match(/( |T)(?<hour>\d\d):(?<minute>\d\d)(?::(?<second>\d\d)(?:\.(?<millisecond>\d\d\d))?)?(?<offset>Z|\+\d\d:\d\d|-\d\d:\d\d)?$/);
    
    if (time_match?.groups) {
      const { hour, minute, second, millisecond, offset } = time_match.groups;

      result.hour = hour ? + hour : 0;
      result.minute = minute ? + minute : 0;
      result.second = second ? + second : 0;
      result.millisecond = millisecond ? + millisecond : 0;
      
      if (offset === 'Z') {
        result.offset = 0;
      } else if (offset) {
        throw new Error(`Unsupported timezone ${offset}`);
      }

      value = value.slice(time_match[0]?.length);
    }

    if (value.length > 0) {
      throw new Error(`Invalid datetime format "${value}"`);
    }

    const intermediate = new Date(result.year, result.month, result.day, result.hour, result.minute, result.second, result.millisecond);
    return new Instant(intermediate.getTime(), Duration.Minutes(result.offset));
  }
}
