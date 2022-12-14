export const MILLISECONDS_PER_MINUTE = 60000;
export const MILLISECONDS_PER_HOUR = 3600000;
export const MILLISECONDS_PER_DAY = 86400000;
export const DAYS_PER_WEEK = 7;
export const MONTHS_PER_YEAR = 12;
// WARN we use these approximate constants for
// relevant Duration maths, but never for Instant
export const DAYS_PER_YEAR = 365;
export const DAYS_PER_MONTH = 30;
export const WEEKS_PER_YEAR = 52;
export const WEEKS_PER_MONTH = 4.345;

// WARN these are all derived from the approximate values above
export const MILLISECONDS_PER_WEEK = MILLISECONDS_PER_DAY * DAYS_PER_WEEK;
export const MILLISECONDS_PER_MONTH = MILLISECONDS_PER_DAY * DAYS_PER_MONTH;
export const MILLISECONDS_PER_YEAR = MILLISECONDS_PER_DAY * DAYS_PER_YEAR;
