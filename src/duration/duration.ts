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

import { second, shifters } from '../floor-shift-ceil/floor-shift-ceil';
import type { Timezone } from '../timezone/timezone';
import type { ImmutableClassInstance } from '../utils/utils';

const SPANS_WITH_WEEK = ['year', 'month', 'week', 'day', 'hour', 'minute', 'second'];
const SPANS_WITHOUT_WEEK = ['year', 'month', 'day', 'hour', 'minute', 'second'];
const SPANS_WITHOUT_WEEK_OR_MONTH = ['year', 'day', 'hour', 'minute', 'second'];
const SPANS_UP_TO_DAY = ['day', 'hour', 'minute', 'second'];

export interface DurationValue {
  year?: number;
  month?: number;
  week?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;

  // Indexable
  [span: string]: number | undefined;
}

function capitalizeFirst(str: string): string {
  if (!str.length) return str;
  return str[0].toUpperCase() + str.slice(1);
}

const periodWeekRegExp = /^P(\d+)W$/;
const periodRegExp =
  /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:((\d+\.)?\d+)S)?)?$/;
//  P   (year ) (month   ) (day     )    T(hour    ) (minute  ) (second            )

function getSpansFromString(durationStr: string): DurationValue {
  const spans: DurationValue = {};
  let matches: RegExpExecArray | null;
  if ((matches = periodWeekRegExp.exec(durationStr))) {
    spans.week = Number(matches[1]);
    if (!spans.week) throw new Error('Duration can not have empty weeks');
  } else if ((matches = periodRegExp.exec(durationStr))) {
    const nums = matches.map(Number);
    for (let i = 0; i < SPANS_WITHOUT_WEEK.length; i++) {
      const span = SPANS_WITHOUT_WEEK[i];
      const value = nums[i + 1];
      if (value) spans[span] = value;
    }
  } else {
    throw new Error("Can not parse duration '" + durationStr + "'");
  }
  return spans;
}

function getSpansFromStartEnd(start: Date, end: Date, timezone: Timezone): DurationValue {
  start = second.floor(start, timezone);
  end = second.floor(end, timezone);
  if (end <= start) throw new Error('start must come before end');

  const spans: DurationValue = {};
  let iterator: Date = start;
  for (let i = 0; i < SPANS_WITHOUT_WEEK.length; i++) {
    const span = SPANS_WITHOUT_WEEK[i];
    let spanCount = 0;

    // Shortcut
    const length = end.valueOf() - iterator.valueOf();
    const canonicalLength: number = shifters[span].canonicalLength;
    if (length < canonicalLength / 4) continue;
    const numberToFit = Math.min(0, Math.floor(length / canonicalLength) - 1);
    let iteratorMove: Date;
    if (numberToFit > 0) {
      // try to skip by numberToFit
      iteratorMove = shifters[span].shift(iterator, timezone, numberToFit);
      if (iteratorMove <= end) {
        spanCount += numberToFit;
        iterator = iteratorMove;
      }
    }

    while (true) {
      iteratorMove = shifters[span].shift(iterator, timezone, 1);
      if (iteratorMove <= end) {
        iterator = iteratorMove;
        spanCount++;
      } else {
        break;
      }
    }

    if (spanCount) {
      spans[span] = spanCount;
    }
  }
  return spans;
}

function removeZeros(spans: DurationValue): DurationValue {
  const newSpans: DurationValue = {};
  for (let i = 0; i < SPANS_WITH_WEEK.length; i++) {
    const span = SPANS_WITH_WEEK[i];
    if (Number(spans[span]) > 0) {
      newSpans[span] = spans[span];
    }
  }
  return newSpans;
}

function fitIntoSpans(length: number, spansToCheck: string[]): Record<string, number> {
  const spans: Record<string, number> = {};

  let lengthLeft = length;
  for (let i = 0; i < spansToCheck.length; i++) {
    const span = spansToCheck[i];
    const spanLength = shifters[span].canonicalLength;
    const count = Math.floor(lengthLeft / spanLength);

    if (count) {
      lengthLeft -= spanLength * count;
      spans[span] = count;
    }
  }

  return spans;
}

/**
 * Represents an ISO duration like P1DT3H
 */
export class Duration implements ImmutableClassInstance<DurationValue, string> {
  public readonly singleSpan?: string;
  public readonly spans: DurationValue;

  static fromJS(durationStr: string): Duration {
    if (typeof durationStr !== 'string') throw new TypeError('Duration JS must be a string');
    return new Duration(getSpansFromString(durationStr));
  }

  static fromCanonicalLength(length: number, skipMonths = false): Duration {
    if (length <= 0) throw new Error('length must be positive');
    let spans = fitIntoSpans(length, skipMonths ? SPANS_WITHOUT_WEEK_OR_MONTH : SPANS_WITHOUT_WEEK);

    if (
      length % shifters['week'].canonicalLength === 0 && // Weeks fits
      (Object.keys(spans).length > 1 || // We already have a more complex span
        spans['day']) // or... we only have days and it might be simpler to express as weeks
    ) {
      spans = { week: length / shifters['week'].canonicalLength };
    }

    return new Duration(spans);
  }

  static fromCanonicalLengthUpToDays(length: number): Duration {
    if (length <= 0) throw new Error('length must be positive');
    return new Duration(fitIntoSpans(length, SPANS_UP_TO_DAY));
  }

  static fromRange(start: Date, end: Date, timezone: Timezone): Duration {
    return new Duration(getSpansFromStartEnd(start, end, timezone));
  }

  /**
   * Constructs a Duration from a string (like 'P1DT3H') or a DurationValue
   */
  // Type overloads
  constructor(spans: DurationValue | string);
  /** @deprecated Use Duration.fromRange instead */
  constructor(start: Date, end: Date, timezone: Timezone);

  // Implementation
  constructor(spans: any, end?: Date, timezone?: Timezone) {
    if (spans && end && timezone) {
      spans = getSpansFromStartEnd(spans, end, timezone);
    } else if (typeof spans === 'object') {
      spans = removeZeros(spans);
    } else if (typeof spans === 'string') {
      spans = getSpansFromString(spans);
    } else {
      throw new Error('new Duration called with bad argument');
    }

    const usedSpans = Object.keys(spans);
    if (!usedSpans.length) throw new Error('Duration can not be empty');
    if (usedSpans.length === 1) {
      this.singleSpan = usedSpans[0];
    } else if (spans.week) {
      throw new Error("Can not mix 'week' and other spans");
    }
    this.spans = spans;
  }

  public toString(short?: boolean) {
    const strArr: string[] = short ? [] : ['P'];
    const spans = this.spans;
    if (spans.week) {
      strArr.push(String(spans.week), 'W');
    } else {
      let needsT = !(short && this.singleSpan);
      for (let i = 0; i < SPANS_WITHOUT_WEEK.length; i++) {
        const span = SPANS_WITHOUT_WEEK[i];
        const value = spans[span];
        if (!value) continue;
        if (needsT && i >= 3) {
          strArr.push('T');
          needsT = false;
        }
        strArr.push(String(value), span[0].toUpperCase());
      }
    }
    return strArr.join('');
  }

  public add(duration: Duration): Duration {
    return Duration.fromCanonicalLength(this.getCanonicalLength() + duration.getCanonicalLength());
  }

  public subtract(duration: Duration): Duration {
    const newCanonicalDuration = this.getCanonicalLength() - duration.getCanonicalLength();
    if (newCanonicalDuration < 0) throw new Error('A duration can not be negative.');
    return Duration.fromCanonicalLength(newCanonicalDuration);
  }

  public multiply(multiplier: number): Duration {
    if (multiplier <= 0) throw new Error('Multiplier must be positive non-zero');
    if (multiplier === 1) return this;
    const newCanonicalDuration = this.getCanonicalLength() * multiplier;
    return Duration.fromCanonicalLength(newCanonicalDuration);
  }

  public valueOf() {
    return this.spans;
  }

  public toJS() {
    return this.toString();
  }

  public toJSON() {
    return this.toString();
  }

  public equals(other: Duration | undefined): boolean {
    return other instanceof Duration && this.toString() === other.toString();
  }

  public isSimple(): boolean {
    const { singleSpan } = this;
    if (!singleSpan) return false;
    return this.spans[singleSpan] === 1;
  }

  public isFloorable(): boolean {
    const { singleSpan } = this;
    if (!singleSpan) return false;
    const span = Number(this.spans[singleSpan]);
    if (span === 1) return true;
    const { siblings } = shifters[singleSpan];
    if (!siblings) return false;
    return siblings % span === 0;
  }

  public makeFloorable(): Duration {
    if (this.isFloorable()) return this;
    const { singleSpan, spans } = this;
    if (singleSpan) return new Duration({ [singleSpan]: 1 });
    for (const span of SPANS_WITH_WEEK) {
      if (spans[span]) return new Duration({ [span]: 1 });
    }
    return new Duration({ second: 1 });
  }

  /**
   * Floors the date according to this duration.
   * @param date The date to floor
   * @param timezone The timezone within which to floor
   */
  public floor(date: Date, timezone: Timezone): Date {
    const { singleSpan } = this;
    if (!singleSpan) throw new Error('Can not operate on a complex duration');
    const span = this.spans[singleSpan]!;
    const mover = shifters[singleSpan];
    let dt = mover.floor(date, timezone);
    if (span !== 1) {
      if (!mover.siblings) {
        throw new Error(`Can not operate on a ${singleSpan} duration that is not 1`);
      }
      if (mover.siblings % span !== 0) {
        throw new Error(
          `Can not operate on a ${singleSpan} duration that does not divide into ${mover.siblings}`,
        );
      }
      dt = mover.round(dt, span, timezone);
    }
    return dt;
  }

  /**
   * Ceilings the date according to this duration
   * @param date The date to ceiling
   * @param timezone The timezone within which to operate
   */
  public ceil(date: Date, timezone: Timezone): Date {
    const floored = this.floor(date, timezone);
    if (floored.valueOf() === date.valueOf()) return date; // Just like ceil(3) is 3 and not 4
    return this.shift(floored, timezone, 1);
  }

  /**
   * Moves the given date by 'step' times of the duration
   * Negative step value will move back in time.
   * @param date The date to move
   * @param timezone The timezone within which to make the move
   * @param step The number of times to step by the duration
   */
  public shift(date: Date, timezone: Timezone, step = 1): Date {
    const spans = this.spans;
    for (const span of SPANS_WITH_WEEK) {
      const value = spans[span];
      if (value) date = shifters[span].shift(date, timezone, step * value);
    }
    return date;
  }

  /**
   * Rounds the date according to this duration (goes to the closest of floor(date) and ceil(date)
   * @param date The date to round
   * @param timezone The timezone within which to operate
   */
  public round(date: Date, timezone: Timezone): Date {
    const floorDate = this.floor(date, timezone);
    const ceilDate = this.ceil(date, timezone);
    const distanceToFloor = Math.abs(date.valueOf() - floorDate.valueOf());
    const distanceToCeil = Math.abs(date.valueOf() - ceilDate.valueOf());
    return distanceToFloor <= distanceToCeil ? floorDate : ceilDate;
  }

  /**
   * Gives the [start, end] of the duration sized bucket in which this date belongs
   * @param date The date to bucket
   * @param timezone The timezone within which to operate
   */
  public range(date: Date, timezone: Timezone): [Date, Date] {
    const start = this.floor(date, timezone);
    return [start, this.shift(start, timezone, 1)];
  }

  /**
   * Materializes all the values of this duration form start to end
   * @param start The date to start on
   * @param end The date to start on
   * @param timezone The timezone within which to materialize
   * @param step The number of times to step by the duration
   */
  public materialize(start: Date, end: Date, timezone: Timezone, step = 1): Date[] {
    const values: Date[] = [];
    let iter = this.makeFloorable().ceil(start, timezone);
    while (iter <= end) {
      values.push(iter);
      iter = this.shift(iter, timezone, step);
    }
    return values;
  }

  /**
   * Checks to see if date is aligned to this duration within the timezone (floors to itself)
   * @param date The date to check
   * @param timezone The timezone within which to make the check
   */
  public isAligned(date: Date, timezone: Timezone): boolean {
    return this.floor(date, timezone).valueOf() === date.valueOf();
  }

  /**
   * Check to see if this duration can be divided by the given duration
   * @param smaller The smaller duration to divide by
   */
  public dividesBy(smaller: Duration): boolean {
    const myCanonicalLength = this.getCanonicalLength();
    const smallerCanonicalLength = smaller.getCanonicalLength();
    return (
      myCanonicalLength % smallerCanonicalLength === 0 &&
      this.isFloorable() &&
      smaller.isFloorable()
    );
  }

  public getCanonicalLength(): number {
    const spans = this.spans;
    let length = 0;
    for (const span of SPANS_WITH_WEEK) {
      const value = spans[span];
      if (value) length += value * shifters[span].canonicalLength;
    }
    return length;
  }

  public getDescription(capitalize?: boolean): string {
    const spans = this.spans;
    const description: string[] = [];
    for (const span of SPANS_WITH_WEEK) {
      const value = spans[span];
      const spanTitle = capitalize ? capitalizeFirst(span) : span;
      if (value) {
        if (value === 1) {
          description.push(spanTitle);
        } else {
          description.push(String(value) + ' ' + spanTitle + 's');
        }
      }
    }
    return description.join(', ');
  }

  public getSingleSpan(): string | undefined {
    return this.singleSpan;
  }

  public getSingleSpanValue(): number | undefined {
    if (!this.singleSpan) return;
    return this.spans[this.singleSpan];
  }

  public limitToDays(): Duration {
    return Duration.fromCanonicalLengthUpToDays(this.getCanonicalLength());
  }
}
