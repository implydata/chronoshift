module Chronoshift {
  export interface AlignFn {
    (dt: Date, tz: Timezone): Date;
  }

  export interface MoveFn {
    (dt: Date, tz: Timezone, step: number): Date;
  }

  export interface TimeMover {
    canonicalLength: number;
    floor: AlignFn;
    move: MoveFn;
    ceil: AlignFn;
  }

  function adjustDay(day: number): number {
    return (day + 6) % 7;
  }

  function timeMoverFactory(canonicalLength: number, floor: AlignFn, move: MoveFn): TimeMover {
    return {
      canonicalLength: canonicalLength,
      floor,
      move,
      ceil: (dt: Date, tz: Timezone) => {
        return move(floor(dt, tz), tz, 1);
      }
    };
  }

  export var second = timeMoverFactory(
    1000,
    (dt, tz) => {
      // Seconds do not actually need a timezone because all timezones align on seconds... for now...
      dt = new Date(dt.valueOf());
      dt.setUTCMilliseconds(0);
      return dt;
    },
    (dt, tz, step) => {
      dt = new Date(dt.valueOf());
      dt.setUTCSeconds(dt.getUTCSeconds() + step);
      return dt;
    }
  );

  export var minute = timeMoverFactory(
    60000,
    (dt, tz) => {
      // Minutes do not actually need a timezone because all timezones align on minutes... for now...
      dt = new Date(dt.valueOf());
      dt.setUTCSeconds(0, 0);
      return dt;
    },
    (dt, tz, step) => {
      dt = new Date(dt.valueOf());
      dt.setUTCMinutes(dt.getUTCMinutes() + step);
      return dt;
    }
  );

  export var hour = timeMoverFactory(
    3600000,
    (dt, tz) => {
      if (tz.isUTC()) {
        dt = new Date(dt.valueOf());
        dt.setUTCMinutes(0, 0, 0);
      } else {
        let wt = WallTime.UTCToWallTime(dt, tz.toString());
        dt = WallTime.WallTimeToUTC(tz.toString(), wt.getFullYear(), wt.getMonth(), wt.getDate(), wt.getHours(), 0, 0, 0);
      }
      return dt;
    },
    (dt, tz, step) => {
      if (tz.isUTC()) {
        dt = new Date(dt.valueOf());
        dt.setUTCHours(dt.getUTCHours() + step);
      } else {
        let wt = WallTime.UTCToWallTime(dt, tz.toString());
        dt = WallTime.WallTimeToUTC(
          tz.toString(),
          wt.getFullYear(), wt.getMonth(), wt.getDate(),
          wt.getHours() + step, wt.getMinutes(), wt.getSeconds(), wt.getMilliseconds()
        );
      }
      return dt;
    }
  );

  export var day = timeMoverFactory(
    24 * 3600000,
    (dt, tz) => {
      if (tz.isUTC()) {
        dt = new Date(dt.valueOf());
        dt.setUTCHours(0, 0, 0, 0);
      } else {
        let wt = WallTime.UTCToWallTime(dt, tz.toString());
        dt = WallTime.WallTimeToUTC(tz.toString(), wt.getFullYear(), wt.getMonth(), wt.getDate(), 0, 0, 0, 0);
      }
      return dt;
    },
    (dt, tz, step) => {
      if (tz.isUTC()) {
        dt = new Date(dt.valueOf());
        dt.setUTCDate(dt.getUTCDate() + step);
      } else {
        let wt = WallTime.UTCToWallTime(dt, tz.toString());
        dt = WallTime.WallTimeToUTC(
          tz.toString(),
          wt.getFullYear(), wt.getMonth(), wt.getDate() + step,
          wt.getHours(), wt.getMinutes(), wt.getSeconds(), wt.getMilliseconds()
        );
      }
      return dt;
    }
  );

  export var week = timeMoverFactory(
    7 * 24 * 3600000,
    (dt, tz) => {
      if (tz.isUTC()) {
        dt = new Date(dt.valueOf());
        dt.setUTCHours(0, 0, 0, 0);
        dt.setUTCDate(dt.getUTCDate() - adjustDay(dt.getUTCDay()));
      } else {
        let wt = WallTime.UTCToWallTime(dt, tz.toString());
        dt = WallTime.WallTimeToUTC(
          tz.toString(),
          wt.getFullYear(), wt.getMonth(), wt.getDate() - adjustDay(wt.getDay()),
          0, 0, 0, 0
        );
      }
      return dt;
    },
    (dt, tz, step) => {
      if (tz.isUTC()) {
        dt = new Date(dt.valueOf());
        dt.setUTCDate(dt.getUTCDate() + step * 7);
      } else {
        let wt = WallTime.UTCToWallTime(dt, tz.toString());
        dt = WallTime.WallTimeToUTC(
          tz.toString(),
          wt.getFullYear(), wt.getMonth(), wt.getDate() + step * 7,
          wt.getHours(), wt.getMinutes(), wt.getSeconds(), wt.getMilliseconds()
        );
      }
      return dt;
    }
  );

  export var month = timeMoverFactory(
    30 * 24 * 3600000,
    (dt, tz) => {
      if (tz.isUTC()) {
        dt = new Date(dt.valueOf());
        dt.setUTCHours(0, 0, 0, 0);
        dt.setUTCDate(1);
      } else {
        let wt = WallTime.UTCToWallTime(dt, tz.toString());
        dt = WallTime.WallTimeToUTC(tz.toString(), wt.getFullYear(), wt.getMonth(), 1, 0, 0, 0, 0);
      }
      return dt;
    },
    (dt, tz, step) => {
      if (tz.isUTC()) {
        dt = new Date(dt.valueOf());
        dt.setUTCMonth(dt.getUTCMonth() + step);
      } else {
        let wt = WallTime.UTCToWallTime(dt, tz.toString());
        dt = WallTime.WallTimeToUTC(
          tz.toString(),
          wt.getFullYear(), wt.getMonth() + step, wt.getDate(),
          wt.getHours(), wt.getMinutes(), wt.getSeconds(), wt.getMilliseconds()
        );
      }
      return dt;
    }
  );

  export var year = timeMoverFactory(
    365 * 24 * 3600000,
    (dt, tz) => {
      if (tz.isUTC()) {
        dt = new Date(dt.valueOf());
        dt.setUTCHours(0, 0, 0, 0);
        dt.setUTCMonth(0, 1);
      } else {
        let wt = WallTime.UTCToWallTime(dt, tz.toString());
        dt = WallTime.WallTimeToUTC(tz.toString(), wt.getFullYear(), 0, 1, 0, 0, 0, 0);
      }
      return dt;
    },
    (dt, tz, step) => {
      if (tz.isUTC()) {
        dt = new Date(dt.valueOf());
        dt.setUTCFullYear(dt.getUTCFullYear() + step);
      } else {
        let wt = WallTime.UTCToWallTime(dt, tz.toString());
        dt = WallTime.WallTimeToUTC(
          tz.toString(),
          wt.getFullYear() + step, wt.getMonth(), wt.getDate(),
          wt.getHours(), wt.getMinutes(), wt.getSeconds(), wt.getMilliseconds()
        );
      }
      return dt;
    }
  );

  export var movers: Lookup<TimeMover> = {
    second: second,
    minute: minute,
    hour: hour,
    day: day,
    week: week,
    month: month,
    year: year
  };
}
