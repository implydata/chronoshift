/*
 * Copyright 2014-2015 Metamarkets Group Inc.
 * Copyright 2015-2019 Imply Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Timezone } from '../timezone/timezone';

import { parseInterval, parseISODate } from './date-parser';

describe('date parser', () => {

  describe('parseISODate', () => {
    const sixHours = 6 * 60 * 60 * 1000;
    const sixHoursThirty = sixHours + 30 * 60 * 1000;

    // Taken from https://github.com/csnover/js-iso8601/blob/lax/tests/test.js
    it('date-part', () => {
      expect(parseISODate('1970-01-01'), 'Unix epoch').toEqual(new Date(Date.UTC(1970, 0, 1, 0, 0, 0, 0)));

      expect(parseISODate('2001'), '2001').toEqual(new Date(Date.UTC(2001, 0, 1, 0, 0, 0, 0)));
      expect(parseISODate('2001-02'), '2001-02').toEqual(new Date(Date.UTC(2001, 1, 1, 0, 0, 0, 0)));
      expect(parseISODate('2001-02-03'), '2001-02-03').toEqual(new Date(Date.UTC(2001, 1, 3, 0, 0, 0, 0)));
      expect(parseISODate('2001-02-03Z'), '2001-02-03Z').toEqual(new Date(Date.UTC(2001, 1, 3, 0, 0, 0, 0)));

      expect(parseISODate('-002001'), '-002001').toEqual(new Date(Date.UTC(-2001, 0, 1, 0, 0, 0, 0)));
      expect(parseISODate('-002001-02'), '-002001-02').toEqual(new Date(Date.UTC(-2001, 1, 1, 0, 0, 0, 0)));
      expect(parseISODate('-002001-02-03'), '-002001-02-03').toEqual(new Date(Date.UTC(-2001, 1, 3, 0, 0, 0, 0)));

      expect(parseISODate('+010000-02'), '+010000-02').toEqual(new Date(Date.UTC(10000, 1, 1, 0, 0, 0, 0)));
      expect(parseISODate('+010000-02-03'), '+010000-02-03').toEqual(new Date(Date.UTC(10000, 1, 3, 0, 0, 0, 0)));
      expect(parseISODate('-010000-02'), '-010000-02').toEqual(new Date(Date.UTC(-10000, 1, 1, 0, 0, 0, 0)));
      expect(parseISODate('-010000-02-03'), '-010000-02-03').toEqual(new Date(Date.UTC(-10000, 1, 3, 0, 0, 0, 0)));

      expect(parseISODate('19700101'), 'non-hyphenated Unix epoch').toEqual(new Date(Date.UTC(1970, 0, 1, 0, 0, 0, 0)));
      expect(parseISODate('19700101Z'), 'non-hyphenated Unix epoch Z').toEqual(new Date(Date.UTC(1970, 0, 1, 0, 0, 0, 0)));

      expect(parseISODate('asdf'), 'invalid YYYY (non-digits)').toBeNull();
      expect(parseISODate('1970-as-df'), 'invalid YYYY-MM-DD (non-digits)').toBeNull();
      expect(parseISODate('1970-01-'), 'invalid YYYY-MM- (extra hyphen)').toBeNull();
      expect(parseISODate('197001'), 'non-hyphenated year-month').toEqual(new Date(Date.UTC(1970, 0, 1, 0, 0, 0, 0)));
      expect(parseISODate('197001Z'), 'non-hyphenated year-month Z').toEqual(new Date(Date.UTC(1970, 0, 1, 0, 0, 0, 0)));

      // TODO: Test for invalid YYYYMM and invalid YYYYY?
    });

    it('date-time (tz = UTC)', () => {
      expect(parseISODate('2001-02-03T04:05'), '2001-02-03T04:05').toEqual(new Date(Date.UTC(2001, 1, 3, 4, 5, 0, 0)));
      expect(parseISODate('2001-02-03T04:05:06'), '2001-02-03T04:05:06').toEqual(new Date(Date.UTC(2001, 1, 3, 4, 5, 6, 0)));
      expect(parseISODate('2001-02-03T04:05:06.007'), '2001-02-03T04:05:06.007').toEqual(new Date(Date.UTC(2001, 1, 3, 4, 5, 6, 7)));

      expect(parseISODate('2001-02-03T04:05Z'), '2001-02-03T04:05Z').toEqual(new Date(Date.UTC(2001, 1, 3, 4, 5, 0, 0)));
      expect(parseISODate('2001-02-03T04:05:06Z'), '2001-02-03T04:05:06Z').toEqual(new Date(Date.UTC(2001, 1, 3, 4, 5, 6, 0)));
      expect(parseISODate('2001-02-03T04:05:06.007Z'), '2001-02-03T04:05:06.007Z').toEqual(new Date(Date.UTC(2001, 1, 3, 4, 5, 6, 7)));

      expect(parseISODate('2001-02-03T04:05-00:00'), '2001-02-03T04:05-00:00').toEqual(new Date(Date.UTC(2001, 1, 3, 4, 5, 0, 0)));
      expect(parseISODate('2001-02-03T04:05:06-00:00'), '2001-02-03T04:05:06-00:00').toEqual(new Date(Date.UTC(2001, 1, 3, 4, 5, 6, 0)));
      expect(parseISODate('2001-02-03T04:05:06.007-00:00'), '2001-02-03T04:05:06.007-00:00').toEqual(new Date(Date.UTC(2001, 1, 3, 4, 5, 6, 7)));

      expect(parseISODate('2001-02-03T04:05+00:00'), '2001-02-03T04:05+00:00').toEqual(new Date(Date.UTC(2001, 1, 3, 4, 5, 0, 0)));
      expect(parseISODate('2001-02-03T04:05:06+00:00'), '2001-02-03T04:05:06+00:00').toEqual(new Date(Date.UTC(2001, 1, 3, 4, 5, 6, 0)));
      expect(parseISODate('2001-02-03T04:05:06.007+00:00'), '2001-02-03T04:05:06.007+00:00').toEqual(new Date(Date.UTC(2001, 1, 3, 4, 5, 6, 7)));

      expect(parseISODate('2001-02-03T04:05-06:30'), '2001-02-03T04:05-06:30').toEqual(new Date(Date.UTC(2001, 1, 3, 4, 5, 0, 0) + sixHoursThirty));
      expect(parseISODate('2001-02-03T04:05:06-06:30'), '2001-02-03T04:05:06-06:30').toEqual(new Date(Date.UTC(2001, 1, 3, 4, 5, 6, 0) + sixHoursThirty));
      expect(parseISODate('2001-02-03T04:05:06.007-06:30'), '2001-02-03T04:05:06.007-06:30').toEqual(new Date(Date.UTC(2001, 1, 3, 4, 5, 6, 7) + sixHoursThirty));

      expect(parseISODate('2001-02-03T04:05+06:30'), '2001-02-03T04:05+06:30').toEqual(new Date(Date.UTC(2001, 1, 3, 4, 5, 0, 0) - sixHoursThirty));
      expect(parseISODate('2001-02-03T04:05:06+06:30'), '2001-02-03T04:05:06+06:30').toEqual(new Date(Date.UTC(2001, 1, 3, 4, 5, 6, 0) - sixHoursThirty));
      expect(parseISODate('2001-02-03T04:05:06.007+06:30'), '2001-02-03T04:05:06.007+06:30').toEqual(new Date(Date.UTC(2001, 1, 3, 4, 5, 6, 7) - sixHoursThirty));

      expect(parseISODate('2001T04:05:06.007'), '2001T04:05:06.007').toEqual(new Date(Date.UTC(2001, 0, 1, 4, 5, 6, 7)));
      expect(parseISODate('2001-02T04:05:06.007'), '2001-02T04:05:06.007').toEqual(new Date(Date.UTC(2001, 1, 1, 4, 5, 6, 7)));
      expect(parseISODate('2001-02-03T04:05:06.007'), '2001-02-03T04:05:06.007').toEqual(new Date(Date.UTC(2001, 1, 3, 4, 5, 6, 7)));
      expect(parseISODate('2001-02-03T04:05:06.07'), '2001-02-03T04:05:06.07').toEqual(new Date(Date.UTC(2001, 1, 3, 4, 5, 6, 70)));
      expect(parseISODate('2001-02-03T04:05:06.7'), '2001-02-03T04:05:06.7').toEqual(new Date(Date.UTC(2001, 1, 3, 4, 5, 6, 700)));
      expect(parseISODate('2001-02-03T04:05:06.007-06:30'), '2001-02-03T04:05:06.007-06:30').toEqual(new Date(Date.UTC(2001, 1, 3, 4, 5, 6, 7) + sixHoursThirty));

      expect(parseISODate('-010000T04:05'), '-010000T04:05').toEqual(new Date(Date.UTC(-10000, 0, 1, 4, 5, 0, 0)));
      expect(parseISODate('-010000-02T04:05'), '-010000-02T04:05').toEqual(new Date(Date.UTC(-10000, 1, 1, 4, 5, 0, 0)));
      expect(parseISODate('-010000-02-03T04:05'), '-010000-02-03T04:05').toEqual(new Date(Date.UTC(-10000, 1, 3, 4, 5, 0, 0)));

      expect(parseISODate('1970-01-01 00:00:00Z'), 'space-separated datetime').toEqual(new Date(Date.UTC(1970, 0, 1, 0, 0, 0, 0)));
      expect(parseISODate('1970-01-01T00:00:00.987654'), 'extended sub-second precision').toEqual(new Date(Date.UTC(1970, 0, 1, 0, 0, 0, 987)));
      expect(parseISODate('1970-01-01T00:00:00,123'), 'comma-delimited milliseconds').toEqual(new Date(Date.UTC(1970, 0, 1, 0, 0, 0, 123)));
      expect(parseISODate('1970-01-01T00:00:00+0630'), 'colon-free timezone part').toEqual(new Date(Date.UTC(1970, 0, 1, 0, 0, 0, 0) - sixHoursThirty));
      expect(parseISODate('1970-01-01T000000'), 'colon-free time part').toEqual(new Date(Date.UTC(1970, 0, 1, 0, 0, 0, 0)));
      expect(parseISODate('1970-01-01T0000'), 'colon-free time part minute hour').toEqual(new Date(Date.UTC(1970, 0, 1, 0, 0, 0, 0)));
      expect(parseISODate('1970-01-01T00'), 'hour only time part').toEqual(new Date(Date.UTC(1970, 0, 1, 0, 0, 0, 0)));
      expect(parseISODate('1970-01-01T00:00.000'), 'invalid date-time (msec with missing seconds)').toBeNull();
    });

    it('date-time (tz = America/Los_Angeles)', () => {
      const tz = Timezone.fromJS('America/Los_Angeles');

      expect(parseISODate('2001-02-03T04:05', tz), '2001-02-03T04:05').toEqual(new Date(Date.UTC(2001, 1, 3, 4 + 8, 5, 0, 0)));
      expect(parseISODate('2001-02-03T04:05:06', tz), '2001-02-03T04:05:06').toEqual(new Date(Date.UTC(2001, 1, 3, 4 + 8, 5, 6, 0)));
      expect(parseISODate('2001-02-03T04:05:06.007', tz), '2001-02-03T04:05:06.007').toEqual(new Date(Date.UTC(2001, 1, 3, 4 + 8, 5, 6, 7)));

      expect(parseISODate('2001-02-03T04:05Z', tz), '2001-02-03T04:05Z').toEqual(new Date(Date.UTC(2001, 1, 3, 4, 5, 0, 0)));
      expect(parseISODate('2001-02-03T04:05:06Z', tz), '2001-02-03T04:05:06Z').toEqual(new Date(Date.UTC(2001, 1, 3, 4, 5, 6, 0)));
      expect(parseISODate('2001-02-03T04:05:06.007Z', tz), '2001-02-03T04:05:06.007Z').toEqual(new Date(Date.UTC(2001, 1, 3, 4, 5, 6, 7)));

    });

    it('date-time (tz = null / local)', () => {
      const tz: any = null;

      expect(parseISODate('2001-02-03T04:05', tz), '2001-02-03T04:05').toEqual(new Date(2001, 1, 3, 4, 5, 0, 0));
      expect(parseISODate('2001-02-03T04:05:06', tz), '2001-02-03T04:05:06').toEqual(new Date(2001, 1, 3, 4, 5, 6, 0));
      expect(parseISODate('2001-02-03T04:05:06.007', tz), '2001-02-03T04:05:06.007').toEqual(new Date(2001, 1, 3, 4, 5, 6, 7));

      expect(parseISODate('2001-02-03T04:05Z', tz), '2001-02-03T04:05Z').toEqual(new Date(Date.UTC(2001, 1, 3, 4, 5, 0, 0)));
      expect(parseISODate('2001-02-03T04:05:06Z', tz), '2001-02-03T04:05:06Z').toEqual(new Date(Date.UTC(2001, 1, 3, 4, 5, 6, 0)));
      expect(parseISODate('2001-02-03T04:05:06.007Z', tz), '2001-02-03T04:05:06.007Z').toEqual(new Date(Date.UTC(2001, 1, 3, 4, 5, 6, 7)));

    });

  });


  describe('parseInterval', () => {

    it('errors on bad start', () => {
      expect(() => {
        parseInterval('2001-02-03T03:05:06.wdf007Z/2001-02-03T04:05:06.007Z');
      }).toThrow("can not parse '2001-02-03T03:05:06.wdf007Z' as ISO date");
    });

    it('errors on bad end', () => {
      expect(() => {
        parseInterval('2001-02-03T03:05:06.007Z/2001-02-03T04:0ada5:06.007Z');
      }).toThrow("can not parse '2001-02-03T04:0ada5:06.007Z' as ISO date");
    });

    it('errors on bad duration', () => {
      expect(() => {
        parseInterval('P1poop');
      }).toThrow("Can not parse duration 'P1poop'");
    });

    it('errors on flipped start end', () => {
      expect(() => {
        parseInterval('2001-02-03T07:05:06.007Z/2001-02-03T04:05:06.007Z');
      }).toThrow("start must be <= end in '2001-02-03T07:05:06.007Z/2001-02-03T04:05:06.007Z'");
    });

    /*
     Has to be one of:
     [start]/[end]
     [start]/[duration]
     [duration]/[end]
     [duration]
     */

    it('works with [start]/[end]', () => {
      const tz = Timezone.UTC;
      const interval = parseInterval('2001-02-03T03:05:06.007Z/2001-02-03T04:05:06.007Z', tz);
      expect(interval.computedStart).toEqual(new Date('2001-02-03T03:05:06.007Z'));
      expect(interval.computedEnd).toEqual(new Date('2001-02-03T04:05:06.007Z'));
    });

    it('works with [start]/[duration]', () => {
      const tz = Timezone.UTC;
      const interval = parseInterval('2001-02-03T03:05:06.007Z/PT1H', tz);
      expect(interval.computedStart).toEqual(new Date('2001-02-03T03:05:06.007Z'));
      expect(interval.computedEnd).toEqual(new Date('2001-02-03T04:05:06.007Z'));
    });

    it('works with [duration]/[end]', () => {
      const tz = Timezone.UTC;
      const interval = parseInterval('PT1H/2001-02-03T04:05:06.007Z', tz);
      expect(interval.computedStart).toEqual(new Date('2001-02-03T03:05:06.007Z'));
      expect(interval.computedEnd).toEqual(new Date('2001-02-03T04:05:06.007Z'));
    });

    it('works with [duration]', () => {
      const now = new Date('2001-02-03T04:05:06.007Z');
      const tz = Timezone.UTC;
      const interval = parseInterval('PT1H', tz, now);
      expect(interval.computedStart).toEqual(new Date('2001-02-03T03:05:06.007Z'));
      expect(interval.computedEnd).toEqual(new Date('2001-02-03T04:05:06.007Z'));
    });

  });

});
