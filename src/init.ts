/*
 * Copyright 2014-2015 Metamarkets Group Inc.
 * Copyright 2015-2016 Imply Data, Inc.
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

module Chronoshift {
  export interface WallTime {
    rules: any;
    UTCToWallTime(date: Date, timezone: string): Date;
    WallTimeToUTC(timezone: string, years: number, months: number, days: number,
                  hours: number, minutes: number, seconds: number, milliseconds: number): Date;
    init(a: any, b: any): void;
  }

  export interface Parser {
    parse: (str: string) => any;
  }

  export var WallTime = <WallTime>require("../lib/walltime");

  var ImmutableClass = <ImmutableClass.Base>require("immutable-class");
  export var isInstanceOf = ImmutableClass.isInstanceOf;

  export import Class = ImmutableClass.Class;
  export import Instance = ImmutableClass.Instance;

  export interface Lookup<T> {
    [key: string]: T;
  }

  export function isDate(d: any) {
    return typeof d === 'object' &&
      d.constructor.name === 'Date';
  }
}

