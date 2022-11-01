import { MILLISECONDS_PER_DAY, MILLISECONDS_PER_HOUR, MILLISECONDS_PER_MINUTE, MILLISECONDS_PER_MONTH, MILLISECONDS_PER_WEEK, MILLISECONDS_PER_YEAR } from './Duration.constants';
import type { SplitDuration } from './Duration.type';
import { Instant } from './Instant';
import { TemporalUnit, TEMPORAL_UNIT_NAME } from './TemporalUnit.constants';

export class Duration<T extends TemporalUnit = TemporalUnit> {
  private constructor(readonly units: T, readonly value: number) {}

  add(other: Duration): Duration {
    const common_unit: TemporalUnit = Math.min(this.units, other.units);
    const a = this.as(common_unit);
    const b = other.as(common_unit);
    return new Duration(common_unit, a + b);
  }

  subtract(other: Duration): Duration {
    const common_unit: TemporalUnit = Math.min(this.units, other.units);
    const a = this.as(common_unit);
    const b = other.as(common_unit);
    return new Duration(common_unit, a - b);
  }

  multiply(factor: number): Duration<T> {
    return new Duration(this.units, this.value * factor);
  }

  negate(): Duration<T> {
    return new Duration(this.units, -this.value);
  }

  clamp(min: Duration): Duration;
  clamp(min: null | undefined, max: Duration): Duration;
  clamp(min: Duration, max: Duration): Duration;
  clamp(min: Duration | null | undefined, max?: Duration): Duration {
    let common_unit: TemporalUnit = this.units;
    if (min) {
      common_unit = Math.min(common_unit, min.units);
    }
    if (max) {
      common_unit = Math.min(common_unit, max.units);
    }
    const a = this.as(common_unit);
    const b = min ? min.as(common_unit) : a;
    const c = max ? max.as(common_unit) : Math.max(a, b);

    return new Duration(common_unit, Math.min(Math.max(a, b), c));
  }

  as(units: TemporalUnit): number {
    switch (units) {
      case TemporalUnit.MILLISECONDS:
        return this.milliseconds;
      case TemporalUnit.SECONDS:
        return this.seconds;
      case TemporalUnit.MINUTES:
        return this.minutes;
      case TemporalUnit.HOURS:
        return this.hours;
      case TemporalUnit.DAYS:
        return this.days;
      case TemporalUnit.WEEKS:
        return this.weeks;
      case TemporalUnit.MONTHS:
        return this.months;
      case TemporalUnit.YEARS:
        return this.years;
    }
  }

  /**
   * @returns Duration resized to an appropriate unit
   */
  normalise(): Duration {
    const base = this.milliseconds;
    if (base < 1000) {
      return new Duration(TemporalUnit.MILLISECONDS, base);
    }
    if (base < MILLISECONDS_PER_MINUTE) {
      return new Duration(TemporalUnit.SECONDS, base / 1000);
    }
    if (base < MILLISECONDS_PER_HOUR) {
      return new Duration(TemporalUnit.MINUTES, base / MILLISECONDS_PER_MINUTE);
    }
    if (base < MILLISECONDS_PER_DAY) {
      return new Duration(TemporalUnit.HOURS, base / MILLISECONDS_PER_HOUR);
    }
    if (base < MILLISECONDS_PER_WEEK) {
      return new Duration(TemporalUnit.DAYS, base / MILLISECONDS_PER_DAY);
    }
    if (base < MILLISECONDS_PER_MONTH) {
      return new Duration(TemporalUnit.WEEKS, base / MILLISECONDS_PER_WEEK);
    }
    return new Duration(TemporalUnit.YEARS, base / MILLISECONDS_PER_YEAR);
  }

  split(): SplitDuration {
    let base = this.milliseconds;

    const years = Duration.Years(Math.floor(base / MILLISECONDS_PER_YEAR));
    base %= MILLISECONDS_PER_YEAR;

    const months = Duration.Months(Math.floor(base / MILLISECONDS_PER_MONTH));
    base %= MILLISECONDS_PER_MONTH;

    const days = Duration.Days(Math.floor(base / MILLISECONDS_PER_DAY));
    base %= MILLISECONDS_PER_DAY;

    const hours = Duration.Hours(Math.floor(base / MILLISECONDS_PER_HOUR));
    base %= MILLISECONDS_PER_HOUR;

    const minutes = Duration.Minutes(Math.floor(base / MILLISECONDS_PER_MINUTE));
    base %= MILLISECONDS_PER_MINUTE;

    const seconds = Duration.Seconds(Math.floor(base / 1000));
    base %= 1000;

    const milliseconds = Duration.Milliseconds(base);

    return { years, months, days, hours, minutes, seconds, milliseconds };
  }

  format (locales?: string | string[], options?: Intl.RelativeTimeFormatOptions) {
    const formatter = new Intl.RelativeTimeFormat(locales, options);
    const unit = TEMPORAL_UNIT_NAME[this.units] ?? 'millisecond';

    // NOTE RelativeTimeFormat does not support 'millisecond' so we switch
    // to the nearest supported unit 'second'
    if (unit === 'millisecond') {
      return formatter.format(this.seconds, 'second');
    }

    return formatter.format(this.value, unit);
  }

  toDate(): Date {
    return new Date(this.milliseconds);
  }

  toInstant(offset: Duration = Duration.ZERO): Instant {
    return new Instant(this.milliseconds, offset);
  }

  toString(): string {
    return this.format();
  }

  toJSON (): { value: number; units: string } {
    return {
      value: this.value,
      units: TemporalUnit[this.units] as string,
    };
  }

  floor(): Duration<T> {
    return new Duration(this.units, Math.floor(this.value));
  }

  round(): Duration<T> {
    return new Duration(this.units, Math.round(this.value));
  }

  ceil(): Duration<T> {
    return new Duration(this.units, Math.ceil(this.value));
  }

  get milliseconds(): number {
    const { value } = this;
    const units: TemporalUnit = this.units;

    switch (units) {
      case TemporalUnit.MILLISECONDS:
        return value;
      case TemporalUnit.SECONDS:
        return value * 1000;
      case TemporalUnit.MINUTES:
        return value * MILLISECONDS_PER_MINUTE;
      case TemporalUnit.HOURS:
        return value * MILLISECONDS_PER_HOUR;
      case TemporalUnit.DAYS:
        return value * MILLISECONDS_PER_DAY;
      case TemporalUnit.WEEKS:
        return value * MILLISECONDS_PER_WEEK;
      case TemporalUnit.MONTHS:
        return value * MILLISECONDS_PER_MONTH;
      case TemporalUnit.YEARS:
        return value * MILLISECONDS_PER_YEAR;
    }
  }

  get seconds(): number {
    if (this.units === TemporalUnit.SECONDS) {
      return this.value;
    }
    return this.milliseconds / 1000;
  }

  get minutes(): number {
    if (this.units === TemporalUnit.MINUTES) {
      return this.value;
    }
    return this.milliseconds / MILLISECONDS_PER_MINUTE;
  }

  get hours(): number {
    if (this.units === TemporalUnit.HOURS) {
      return this.value;
    }
    return this.milliseconds / MILLISECONDS_PER_HOUR;
  }

  get days(): number {
    if (this.units === TemporalUnit.DAYS) {
      return this.value;
    }
    return this.milliseconds / MILLISECONDS_PER_DAY;
  }

  get weeks(): number {
    if (this.units === TemporalUnit.WEEKS) {
      return this.value;
    }
    return this.milliseconds / MILLISECONDS_PER_WEEK;
  }

  get months(): number {
    if (this.units === TemporalUnit.MONTHS) {
      return this.value;
    }
    return this.milliseconds / MILLISECONDS_PER_MONTH;
  }

  get years(): number {
    if (this.units === TemporalUnit.YEARS) {
      return this.value;
    }
    return this.milliseconds / MILLISECONDS_PER_YEAR;
  }

  static FromDate(value: Date | string): Duration<TemporalUnit.MILLISECONDS> {
    const date = value instanceof Date ? value : new Date(value);
    return new Duration(TemporalUnit.MILLISECONDS, date.getTime());
  }

  /**
   * @param value a Date in the past
   * @returns Duration since a that Date
   */
  static Since(value: Date | string): Duration<TemporalUnit.MILLISECONDS> {
    const date = value instanceof Date ? value : new Date(value);
    return new Duration(TemporalUnit.MILLISECONDS, Date.now() - date.getTime());
  }

  /**
   * @param value a Date in the future
   * @returns Duration until a that Date
   */
  static Until(value: Date | string): Duration<TemporalUnit.MILLISECONDS> {
    const date = value instanceof Date ? value : new Date(value);
    return new Duration(TemporalUnit.MILLISECONDS, date.getTime() - Date.now());
  }

  static Delta(): () => Duration<TemporalUnit.MILLISECONDS> {
    const start = Date.now();
    return () => {
      const delta = Date.now() - start;
      return Duration.Milliseconds(delta);
    };
  }

  static Years(value: number): Duration<TemporalUnit.YEARS> {
    return new Duration(TemporalUnit.YEARS, value);
  }

  static Months(value: number): Duration<TemporalUnit.MONTHS> {
    return new Duration(TemporalUnit.MONTHS, value);
  }

  static Weeks(value: number): Duration<TemporalUnit.WEEKS> {
    return new Duration(TemporalUnit.WEEKS, value);
  }

  static Days(value: number): Duration<TemporalUnit.DAYS> {
    return new Duration(TemporalUnit.DAYS, value);
  }

  static Hours(value: number): Duration<TemporalUnit.HOURS> {
    return new Duration(TemporalUnit.HOURS, value);
  }

  static Minutes(value: number): Duration<TemporalUnit.MINUTES> {
    return new Duration(TemporalUnit.MINUTES, value);
  }

  static Seconds(value: number): Duration<TemporalUnit.SECONDS> {
    return new Duration(TemporalUnit.SECONDS, value);
  }

  static Milliseconds(value: number): Duration<TemporalUnit.MILLISECONDS> {
    return new Duration(TemporalUnit.MILLISECONDS, value);
  }

  // NOTE we use the largest possible unit here, as most operations choose the
  // highest common unit ( effectively causing it to choose a smaller unit )
  // so this will preserve higher units when used in operations
  static ZERO = Duration.Years(0);
  // NOTE these are provided as unit values for public convienience
  static SECOND = Duration.Seconds(1);
  static MINUTE = Duration.Minutes(1);
  static HOUR = Duration.Hours(1);
  static DAY = Duration.Days(1);
  static WEEK = Duration.Weeks(1);
  static MONTH = Duration.Months(1);
  static YEAR = Duration.Years(1);
}
