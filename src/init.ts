/// <reference path="../typings/immutable-class.d.ts" />
"use strict";

declare function require(file: string): any;
declare var module: { exports: any; };

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

