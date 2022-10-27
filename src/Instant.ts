import { Duration } from './Duration';
import { TemporalUnit } from './Duration.constants';

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
    const result = new Date(this.value);
    switch (delta.units) {
      case TemporalUnit.MILLISECONDS:
        result.setTime(result.getTime() - Math.round(delta.value));
        break;
      case TemporalUnit.SECONDS:
        result.setSeconds(result.getSeconds() - Math.round(delta.value));
        break;
      case TemporalUnit.MINUTES:
        result.setMinutes(result.getMinutes() - Math.round(delta.value));
        break;
      case TemporalUnit.HOURS:
        result.setHours(result.getHours() - Math.round(delta.value));
        break;
      case TemporalUnit.DAYS:
        result.setDate(result.getDate() - Math.round(delta.value));
        break;
      case TemporalUnit.WEEKS:
        result.setDate(result.getDate() - Math.round(delta.days));
        break;
      case TemporalUnit.MONTHS:
        result.setMonth(result.getMonth() - Math.round(delta.value));
        break;
      case TemporalUnit.YEARS:
        result.setFullYear(result.getFullYear() - Math.round(delta.value));
        break;
    }
    return new Instant(result.getTime(), this.offset);
  }

  static Now (): Instant {
    const now = new Date();
    return new Instant(now.getTime(), Duration.Minutes(now.getTimezoneOffset()));
  }
}