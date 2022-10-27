import type { Duration } from './Duration';

export interface SplitDuration {
  years: Duration;
  months: Duration;
  days: Duration;
  hours: Duration;
  minutes: Duration;
  seconds: Duration;
  milliseconds: Duration;
}