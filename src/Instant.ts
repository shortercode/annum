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

  change_offset (offset = Duration.ZERO): Instant {
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
    const now = new Date();
    // NOTE +ve timezone has a -ve offset
    const offset = Duration.Minutes(-now.getTimezoneOffset());
    // NOTE time is always UTC
    const time = now.getTime();

    return new Instant(time + offset.milliseconds, offset);
  }

  static LocalOffset (): Duration<TemporalUnit.MINUTES> {
    const now = new Date();
    // NOTE +ve timezone has a -ve offset
    return Duration.Minutes(-now.getTimezoneOffset());
  }
}