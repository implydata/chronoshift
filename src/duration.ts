module Chronoshift {
  var spansWithWeek = ["year", "month", "week", "day", "hour", "minute", "second"];
  var spansWithoutWeek = ["year", "month", "day", "hour", "minute", "second"];

  export interface DurationValue {
    year?: number;
    month?: number;
    week?: number;
    day?: number;
    hour?: number;
    minute?: number;
    second?: number;

    // Indexable
    [span: string]: number;
  }


  var periodWeekRegExp = /^P(\d+)W$/;
  var periodRegExp = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/;
//                   P   (year ) (month   ) (day     )    T(hour    ) (minute  ) (second  )
  function getSpansFromString(durationStr: string): DurationValue {
    var spans: DurationValue = {};
    var matches: any[];
    if (matches = periodWeekRegExp.exec(durationStr)) {
      spans.week = Number(matches[1]);
      if (!spans.week) throw new Error("Duration can not be empty");
    } else if (matches = periodRegExp.exec(durationStr)) {
      matches = matches.map(Number);
      for (var i = 0; i < spansWithoutWeek.length; i++) {
        var span = spansWithoutWeek[i];
        var value = matches[i + 1];
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
    if (end <= start) throw new Error("start must come before end");

    var spans: DurationValue = {};
    var iterator: Date = start;
    for (var i = 0; i < spansWithoutWeek.length; i++) {
      var span = spansWithoutWeek[i];
      var spanCount = 0;

      // Shortcut
      var length = end.valueOf() - iterator.valueOf();
      var canonicalLength: number = movers[span].canonicalLength;
      if (length < canonicalLength / 4) continue;
      var numberToFit = Math.min(0, Math.floor(length / canonicalLength) - 1);
      var iteratorMove: Date;
      if (numberToFit > 0) {
        // try to skip by numberToFit
        iteratorMove = movers[span].move(iterator, timezone, numberToFit);
        if (iteratorMove <= end) {
          spanCount += numberToFit;
          iterator = iteratorMove;
        }
      }

      while (true) {
        iteratorMove = movers[span].move(iterator, timezone, 1);
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
    var newSpans: DurationValue = {};
    for (var i = 0; i < spansWithWeek.length; i++) {
      var span = spansWithWeek[i];
      if (spans[span] > 0) {
        newSpans[span] = spans[span];
      }
    }
    return newSpans;
  }

  /**
   * Represents an ISO duration like P1DT3H
   */
  var check: Class<DurationValue, string>;
  export class Duration implements Instance<DurationValue, string> {
    private singleSpan: string;
    private spans: DurationValue;

    static fromJS(durationStr: string): Duration {
      if (typeof durationStr !== 'string') throw new TypeError("Duration JS must be a string");
      return new Duration(getSpansFromString(durationStr));
    }

    static fromCanonicalLength(length: number): Duration {
      var spans: any = {};

      for (var i = 0; i < spansWithWeek.length; i++) {
        var span = spansWithWeek[i];
        var spanLength = movers[span].canonicalLength;
        var count = Math.floor(length / spanLength);

        length -= spanLength * count;

        spans[span] = count;
      }

      return new Duration(spans);
    }

    static isDuration(candidate: any): boolean {
      return isInstanceOf(candidate, Duration);
    }

    /**
     * Constructs an ISO duration like P1DT3H from a string
     */
    constructor(spans: DurationValue);
    constructor(start: Date, end: Date, timezone: Timezone);
    constructor(spans: any, end?: Date, timezone?: Timezone) {
      if (spans && end && timezone) {
        spans = getSpansFromStartEnd(spans, end, timezone);
      } else if (typeof spans === 'object') {
        spans = removeZeros(spans);
      } else {
        throw new Error("new Duration called with bad argument");
      }

      var usedSpans = Object.keys(spans);
      if (!usedSpans.length) throw new Error("Duration can not be empty");
      if (usedSpans.length === 1) {
        this.singleSpan = usedSpans[0];
      } else if (spans.week) {
        throw new Error("Can not mix 'week' and other spans");
      }
      this.spans = spans;
    }

    public toString() {
      var strArr: string[] = ["P"];
      var spans = this.spans;
      if (spans.week) {
        strArr.push(String(spans.week), 'W');
      } else {
        var addedT = false;
        for (var i = 0; i < spansWithoutWeek.length; i++) {
          var span = spansWithoutWeek[i];
          var value = spans[span];
          if (!value) continue;
          if (!addedT && i >= 3) {
            strArr.push("T");
            addedT = true;
          }
          strArr.push(String(value), span[0].toUpperCase());
        }
      }
      return strArr.join("");
    }

    public add(duration: Duration): Duration {
      return Duration.fromCanonicalLength(
        this.getCanonicalLength() + duration.getCanonicalLength()
      );
    }

    public subtract(duration: Duration): Duration {
      if (this.getCanonicalLength() - duration.getCanonicalLength() < 0) {
        throw new Error("A duration can not be negative.");
      }

      return Duration.fromCanonicalLength(
        this.getCanonicalLength() - duration.getCanonicalLength()
      );
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

    public equals(other: Duration): boolean {
      return Boolean(other) &&
        this.toString() === other.toString();
    }

    public isSimple(): boolean {
      return Boolean(this.singleSpan) &&
        this.spans[this.singleSpan] === 1;
    }

    /**
     * Floors the date according to this duration.
     * @param date The date to floor
     * @param timezone The timezone within which to floor
     */
    public floor(date: Date, timezone: Timezone): Date {
      if (!this.isSimple()) throw new Error("Can not floor on a complex duration");
      return movers[this.singleSpan].floor(date, timezone);
    }

    /**
     * Moves the given date by 'step' times of the duration
     * Negative step value will move back in time.
     * @param date The date to move
     * @param timezone The timezone within which to make the move
     * @param step The number of times to step by the duration
     */
    public move(date: Date, timezone: Timezone, step: number = 1) {
      var spans = this.spans;
      for (let span of spansWithWeek) {
        var value = spans[span];
        if (value) date = movers[span].move(date, timezone, step * value);
      }
      return date;
    }

    public getCanonicalLength(): number {
      var spans = this.spans;
      var length = 0;
      for (let span of spansWithWeek) {
        var value = spans[span];
        if (value) length += value * movers[span].canonicalLength;
      }
      return length;
    }

    public canonicalLength(): number {
      // This method is deprecated
      console.warn("The method 'canonicalLength()' is deprecated. Please use 'getCanonicalLength()' instead.");
      return this.getCanonicalLength();
    }

    public getDescription(): string {
      var spans = this.spans;
      var description: string[] = [];
      for (let span of spansWithWeek) {
        var value = spans[span];
        if (value) {
          if (value === 1) {
            description.push(span);
          } else {
            description.push(String(value) + ' ' + span + 's');
          }
        }
      }
      return description.join(', ');
    }
  }
  check = Duration;
}
