import { Duration } from './Duration';
import sinon from 'sinon';
import { TemporalUnit } from './TemporalUnit.constants';
import { WEEKS_PER_MONTH } from './Duration.constants';

function random_integer(n: number) {
  return Math.floor(n * Math.random());
}

export function is_sinon_stub<P extends unknown[], R>(fn: (...args: P) => R): fn is sinon.SinonStub<P, R> {
  // WARN does not work for sinon spies or fakes, only stubs
  return typeof fn === 'function' && ('restore' in fn || fn.name === 'functionStub');
}

describe('duration', () => {
  afterEach(() => {
    const now = Date.now;
    if (is_sinon_stub(now)) {
      now.restore();
    }
  });
  it('Duration.Hours', () => {
    const value = random_integer(1000);
    expect(Duration.Hours(value)).toEqual({
      value,
      units: 3,
    });
  });
  it('Duration.Minutes', () => {
    const value = random_integer(1000);
    expect(Duration.Minutes(value)).toEqual({
      value,
      units: 2,
    });
  });
  it('Duration.Seconds', () => {
    const value = random_integer(1000);
    expect(Duration.Seconds(value)).toEqual({
      value,
      units: 1,
    });
  });
  it('Duration.Milliseconds', () => {
    const value = random_integer(1000);
    expect(Duration.Milliseconds(value)).toEqual({
      value,
      units: 0,
    });
  });
  it('Duration.ZERO', () => {
    expect(Duration.ZERO).toEqual({
      value: 0,
      units: TemporalUnit.YEARS,
    });
  });
  it('Duration.FromDate(string)', () => {
    const now = new Date();
    expect(Duration.FromDate(now.toISOString())).toEqual({
      value: now.getTime(),
      units: 0,
    });
  });
  it('Duration.FromDate(date)', () => {
    const now = new Date();
    expect(Duration.FromDate(now)).toEqual({
      value: now.getTime(),
      units: 0,
    });
  });
  it('Duration.Delta', () => {
    let counter = 0;
    sinon.stub(Date, 'now').callsFake((): number => (counter += 100));

    const get_delta = Duration.Delta();
    expect(get_delta()).toEqual({
      value: 100,
      units: 0,
    });
    expect(get_delta()).toEqual({
      value: 200,
      units: 0,
    });
  });
  it('duration.milliseconds', () => {
    expect(Duration.Years(1).milliseconds).toEqual(31536000000);
    expect(Duration.Months(1).milliseconds).toEqual(2592000000);
    expect(Duration.Weeks(1).milliseconds).toEqual(604800000);
    expect(Duration.Days(1).milliseconds).toEqual(86400000);
    expect(Duration.Hours(1).milliseconds).toEqual(3600000);
    expect(Duration.Minutes(1).milliseconds).toEqual(60000);
    expect(Duration.Seconds(1).milliseconds).toEqual(1000);
    expect(Duration.Milliseconds(1).milliseconds).toEqual(1);
  });
  it('duration.seconds', () => {
    expect(Duration.Years(1).seconds).toEqual(31536000);
    expect(Duration.Months(1).seconds).toEqual(2592000);
    expect(Duration.Weeks(1).seconds).toEqual(604800);
    expect(Duration.Days(1).seconds).toEqual(86400);
    expect(Duration.Hours(1).seconds).toEqual(3600);
    expect(Duration.Minutes(1).seconds).toEqual(60);
    expect(Duration.Seconds(1).seconds).toEqual(1);
    expect(Duration.Milliseconds(1000).seconds).toEqual(1);
  });
  it('duration.minutes', () => {
    expect(Duration.Years(1).minutes).toEqual(525600);
    expect(Duration.Months(1).minutes).toEqual(43200);
    expect(Duration.Weeks(1).minutes).toEqual(10080);
    expect(Duration.Days(1).minutes).toEqual(1440);
    expect(Duration.Hours(1).minutes).toEqual(60);
    expect(Duration.Minutes(1).minutes).toEqual(1);
    expect(Duration.Seconds(60).minutes).toEqual(1);
    expect(Duration.Milliseconds(60000).minutes).toEqual(1);
  });
  it('duration.hours', () => {
    expect(Duration.Years(1).hours).toEqual(8760);
    expect(Duration.Months(1).hours).toEqual(720);
    expect(Duration.Weeks(1).hours).toEqual(168);
    expect(Duration.Days(1).hours).toEqual(24);
    expect(Duration.Hours(1).hours).toEqual(1);
    expect(Duration.Minutes(60).hours).toEqual(1);
    expect(Duration.Seconds(3600).hours).toEqual(1);
    expect(Duration.Milliseconds(3600000).hours).toEqual(1);
  });
  it('duration.days', () => {
    expect(Duration.Years(1).days).toEqual(365);
    expect(Duration.Months(1).days).toEqual(30);
    expect(Duration.Weeks(1).days).toEqual(7);
    expect(Duration.Days(1).days).toEqual(1);
    expect(Duration.Hours(24).days).toEqual(1);
    expect(Duration.Minutes(24 * 60).days).toEqual(1);
    expect(Duration.Seconds(24 * 60 * 60).days).toEqual(1);
    expect(Duration.Milliseconds(24 * 60 * 60 * 1000).days).toEqual(1);
  });
  it('duration.weeks', () => {
    expect(Duration.Years(1).weeks).toEqual(52);
    expect(Duration.Months(1).weeks).toEqual(4.345);
    expect(Duration.Weeks(1).weeks).toEqual(1);
    expect(Duration.Days(7).weeks).toEqual(1);
    expect(Duration.Hours(7 * 24).weeks).toEqual(1);
    expect(Duration.Minutes(7 * 24 * 60).weeks).toEqual(1);
    expect(Duration.Seconds(7 * 24 * 60 * 60).weeks).toEqual(1);
    expect(Duration.Milliseconds(7 * 24 * 60 * 60 * 1000).weeks).toEqual(1);
  });
  it('duration.months', () => {
    expect(Duration.Years(1).months).toBeCloseTo(12);
    expect(Duration.Months(1).months).toEqual(1);
    expect(Duration.Weeks(WEEKS_PER_MONTH).months).toBeCloseTo(1);
    expect(Duration.Days(30).months).toEqual(1);
    expect(Duration.Hours(30 * 24).months).toEqual(1);
    expect(Duration.Minutes(30 * 24 * 60).months).toEqual(1);
    expect(Duration.Seconds(30 * 24 * 60 * 60).months).toEqual(1);
    expect(Duration.Milliseconds(30 * 24 * 60 * 60 * 1000).months).toEqual(1);
  });
  it('duration.toDate', () => {
    const a = new Date();
    const now = Duration.Milliseconds(a.getTime());
    expect(now.toDate().getTime()).toEqual(a.getTime());
  });
  it('duration.as', () => {
    const now = Duration.Milliseconds(Date.now());

    expect(now.as(TemporalUnit.MILLISECONDS)).toEqual(now.milliseconds);
    expect(now.as(TemporalUnit.SECONDS)).toEqual(now.seconds);
    expect(now.as(TemporalUnit.MINUTES)).toEqual(now.minutes);
    expect(now.as(TemporalUnit.HOURS)).toEqual(now.hours);
    expect(now.as(TemporalUnit.DAYS)).toEqual(now.days);
    expect(now.as(TemporalUnit.WEEKS)).toEqual(now.weeks);
    expect(now.as(TemporalUnit.MONTHS)).toEqual(now.months);
    expect(now.as(TemporalUnit.YEARS)).toEqual(now.years);
  });
  it('duration.clamp', () => {
    expect(Duration.Seconds(10).clamp(Duration.ZERO)).toEqual({
      units: TemporalUnit.SECONDS,
      value: 10,
    });
    expect(Duration.Minutes(1).clamp(Duration.ZERO, Duration.Seconds(5))).toEqual({
      units: TemporalUnit.SECONDS,
      value: 5,
    });
    expect(Duration.Seconds(10).clamp(null, Duration.Seconds(5))).toEqual({
      units: TemporalUnit.SECONDS,
      value: 5,
    });

    expect(Duration.Seconds(-10).clamp(Duration.ZERO)).toEqual({
      units: TemporalUnit.SECONDS,
      value: 0,
    });
    expect(Duration.Minutes(-1).clamp(Duration.ZERO, Duration.Seconds(5))).toEqual({
      units: TemporalUnit.SECONDS,
      value: 0,
    });
    expect(Duration.Seconds(10).clamp(null, Duration.Seconds(5))).toEqual({
      units: TemporalUnit.SECONDS,
      value: 5,
    });
  });
  it('duration.multiply', () => {
    expect(Duration.Seconds(20).multiply(3)).toEqual({
      units: TemporalUnit.SECONDS,
      value: 60,
    });
    expect(Duration.Hours(0.5).multiply(-2)).toEqual({
      units: TemporalUnit.HOURS,
      value: -1,
    });
  });
  it('duration.subtract', () => {
    expect(Duration.Seconds(1).subtract(Duration.Milliseconds(1))).toEqual({
      units: TemporalUnit.MILLISECONDS,
      value: 999,
    });
    expect(Duration.Seconds(2).subtract(Duration.Minutes(-1))).toEqual({
      units: TemporalUnit.SECONDS,
      value: 62,
    });
  });
  it('duration.add', () => {
    expect(Duration.Seconds(1).add(Duration.Milliseconds(1))).toEqual({
      units: TemporalUnit.MILLISECONDS,
      value: 1001,
    });
    expect(Duration.Seconds(2).add(Duration.Minutes(-1))).toEqual({
      units: TemporalUnit.SECONDS,
      value: -58,
    });
  });
  it.todo('duration.negate');
  it.todo('duration.normalise');
  it.todo('duration.split');
  it.todo('duration.format');
  it.todo('duration.toInstant');
  it.todo('duration.toString');
  it.todo('duration.toJSON');
  it.todo('duration.floor');
  it.todo('duration.round');
  it.todo('duration.ceil');

});
