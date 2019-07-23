/*
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

/* tslint:disable:no-conditional-assignment */

import moment from 'moment-timezone';

import { Duration } from '../duration/duration';
import { Timezone } from '../timezone/timezone';

function parseYear(v: string): number {
  if (v.length === 2) {
    const vn = parseInt(v, 10);
    return (vn < 70 ? 2000 : 1900) + vn;
  } else if (v.length === 4) {
    return parseInt(v, 10);
  } else {
    throw new Error('Invalid year in date');
  }
}

function parseMonth(v: string): number {
  const vn = parseInt(v, 10);
  if (vn <= 0 || 12 < vn) throw new Error('Invalid month in date');
  return vn - 1;
}

function parseDay(v: string): number {
  const vn = parseInt(v, 10);
  if (vn <= 0 || 31 < vn) throw new Error('Invalid day in date');
  return vn;
}

function parseHour(v: string): number {
  const vn = parseInt(v, 10);
  if (vn < 0 || 24 < vn) throw new Error('Invalid hour in date');
  return vn;
}

function parseMinute(v: string): number {
  const vn = parseInt(v, 10);
  if (vn < 0 || 60 < vn) throw new Error('Invalid minute in date');
  return vn;
}

function parseSecond(v: string): number {
  const vn = parseInt(v, 10);
  if (vn < 0 || 60 < vn) throw new Error('Invalid second in date');
  return vn;
}

function parseMillisecond(v: string): number {
  if (!v) return 0;
  return parseInt(v.substr(0, 3), 10);
}

export function parseSQLDate(type: string, v: string): Date {
  if (type === 't') throw new Error('time literals are not supported');
  let m: RegExpMatchArray | null;
  let d: number;
  if (type === 'ts') {
    if ((m = v.match(/^(\d{2}(?:\d{2})?)(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/))) {
      d = Date.UTC(
        parseYear(m[1]),
        parseMonth(m[2]),
        parseDay(m[3]),
        parseHour(m[4]),
        parseMinute(m[5]),
        parseSecond(m[6]),
      );
    } else if (
      (m = v.match(
        /^(\d{2}(?:\d{2})?)[~!@#$%^&*()_+=:.\-\/](\d{1,2})[~!@#$%^&*()_+=:.\-\/](\d{1,2})[T ](\d{1,2})[~!@#$%^&*()_+=:.\-\/](\d{1,2})[~!@#$%^&*()_+=:.\-\/](\d{1,2})(?:\.(\d{1,6}))?$/,
      ))
    ) {
      d = Date.UTC(
        parseYear(m[1]),
        parseMonth(m[2]),
        parseDay(m[3]),
        parseHour(m[4]),
        parseMinute(m[5]),
        parseSecond(m[6]),
        parseMillisecond(m[7]),
      );
    } else {
      throw new Error('Invalid timestamp');
    }
  } else {
    if ((m = v.match(/^(\d{2}(?:\d{2})?)(\d{2})(\d{2})$/))) {
      d = Date.UTC(parseYear(m[1]), parseMonth(m[2]), parseDay(m[3]));
    } else if (
      (m = v.match(
        /^(\d{2}(?:\d{2})?)[~!@#$%^&*()_+=:.\-\/](\d{1,2})[~!@#$%^&*()_+=:.\-\/](\d{1,2})$/,
      ))
    ) {
      d = Date.UTC(parseYear(m[1]), parseMonth(m[2]), parseDay(m[3]));
    } else {
      throw new Error('Invalid date');
    }
  }
  return new Date(d);
}

// Taken from: https://github.com/csnover/js-iso8601/blob/lax/iso8601.js
const numericKeys = [1, 4, 5, 6, 10, 11];
export function parseISODate(date: string, timezone = Timezone.UTC): Date | null {
  let struct: any;
  let minutesOffset = 0;

  /*
  (
    \d{4}
  |
    [+\-]
    \d{6}
  )
  (?:
    -?
    (\d{2})
    (?:
      -?
      (\d{2})
    )?
  )?
  (?:
    [ T]?
    (\d{2})
    (?:
      :?
      (\d{2})
      (?:
        :?
        (\d{2})
        (?:
          [,\.]
          (\d{1,})
        )?
      )?
    )?
  )?
  (?:
    (Z)
  |
    ([+\-])
    (\d{2})
    (?:
      :?
      (\d{2})
    )?
  )?
  */

  //              1 YYYY                 2 MM        3 DD               4 HH        5 mm        6 ss           7 msec             8 Z 9 ±    10 tzHH    11 tzmm
  if (
    (struct = /^(\d{4}|[+\-]\d{6})(?:-?(\d{2})(?:-?(\d{2}))?)?(?:[ T]?(\d{2})(?::?(\d{2})(?::?(\d{2})(?:[,\.](\d{1,}))?)?)?)?(?:(Z)|([+\-])(\d{2})(?::?(\d{2}))?)?$/.exec(
      date,
    ))
  ) {
    // avoid NaN timestamps caused by “undefined” values being passed to Date.UTC
    for (let i = 0, k: number; (k = numericKeys[i]); ++i) {
      struct[k] = +struct[k] || 0;
    }

    // allow undefined days and months
    struct[2] = (+struct[2] || 1) - 1;
    struct[3] = +struct[3] || 1;

    // allow arbitrary sub-second precision beyond milliseconds
    struct[7] = struct[7] ? +(struct[7] + '00').substr(0, 3) : 0;

    if (
      (struct[8] === undefined || struct[8] === '') &&
      (struct[9] === undefined || struct[9] === '') &&
      !Timezone.UTC.equals(timezone)
    ) {
      if (timezone === null) {
        // timezone explicitly set to null = use local timezone
        return new Date(
          struct[1],
          struct[2],
          struct[3],
          struct[4],
          struct[5],
          struct[6],
          struct[7],
        );
      } else {
        return new Date(
          moment
            .tz(
              {
                year: struct[1],
                month: struct[2],
                day: struct[3],
                hour: struct[4],
                minute: struct[5],
                second: struct[6],
                millisecond: struct[7],
              },
              timezone.toString(),
            )
            .valueOf(),
        );
      }
    } else {
      if (struct[8] !== 'Z' && struct[9] !== undefined) {
        minutesOffset = struct[10] * 60 + struct[11];

        if (struct[9] === '+') {
          minutesOffset = 0 - minutesOffset;
        }
      }

      return new Date(
        Date.UTC(
          struct[1],
          struct[2],
          struct[3],
          struct[4],
          struct[5] + minutesOffset,
          struct[6],
          struct[7],
        ),
      );
    }
  } else {
    return null;
  }
}

export interface IntervalParse {
  computedStart: Date;
  computedEnd: Date;
  start?: Date | null;
  end?: Date | null;
  duration?: Duration | null;
}

export function parseInterval(
  str: string,
  timezone = Timezone.UTC,
  now = new Date(),
): IntervalParse {
  const parts = str.split('/');
  if (parts.length > 2) throw new Error(`Can not parse string ${str}`);

  let start: Date | null = null;
  let end: Date | null = null;
  let duration: Duration | null = null;

  const p0: string = parts[0];
  if (parts.length === 1) {
    duration = Duration.fromJS(p0);
  } else {
    const p1 = parts[1];
    if (p0[0] === 'P') {
      duration = Duration.fromJS(p0);
      end = parseISODate(p1, timezone);
      if (!end) throw new Error(`can not parse '${p1}' as ISO date`);
    } else if (p1[0] === 'P') {
      start = parseISODate(p0, timezone);
      if (!start) throw new Error(`can not parse '${p0}' as ISO date`);
      duration = Duration.fromJS(p1);
    } else {
      start = parseISODate(p0, timezone);
      if (!start) throw new Error(`can not parse '${p0}' as ISO date`);
      end = parseISODate(p1, timezone);
      if (!end) throw new Error(`can not parse '${p1}' as ISO date`);

      if (end < start) {
        throw new Error(`start must be <= end in '${str}'`);
      }
    }
  }

  /*
  Has to be one of:
   <start>/<end>
   <start>/<duration>
   <duration>/<end>
   <duration>
   */

  let computedStart: Date;
  let computedEnd: Date;
  if (start) {
    computedStart = start;
    if (duration) {
      computedEnd = duration.shift(computedStart, timezone, 1);
    } else {
      computedEnd = end!;
    }
  } else {
    computedEnd = end || now;
    computedStart = duration!.shift(computedEnd, timezone, -1);
  }

  return {
    computedStart,
    computedEnd,
    start,
    end,
    duration,
  };
}
