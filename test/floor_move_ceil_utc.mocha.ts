/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../build/chronoshift.d.ts" />
"use strict";

declare function require(file: string): any;

import chai = require("chai");
import expect = chai.expect;

import ImmutableClassTesterModule = require("../node_modules/immutable-class/build/tester");

var chronoshift = <typeof Chronoshift>require("../build/chronoshift");
var Timezone = chronoshift.Timezone;

function pairwise<T>(array: T[], callback:(t1:T, t2:T) => void) {
  for (var i = 0; i < array.length - 1; i++) {
    callback(array[i], array[i + 1])
  }
}

describe("floor, move, ceil (UTC)", () => {
  var tz = Timezone.UTC;

  it("moves seconds", () => {
    var dates: Date[] = [
      new Date("2012-11-04T00:00:00"),
      new Date("2012-11-04T00:00:03"),
      new Date("2012-11-04T00:00:06"),
      new Date("2012-11-04T00:00:09"),
      new Date("2012-11-04T00:00:12")
    ];
    pairwise(dates, (d1, d2) => expect(chronoshift.second.move(d1, tz, 3)).to.deep.equal(d2));
  });

  it("moves minutes", () => {
    var dates: Date[] = [
      new Date("2012-11-04T00:00:00"),
      new Date("2012-11-04T00:03:00"),
      new Date("2012-11-04T00:06:00"),
      new Date("2012-11-04T00:09:00"),
      new Date("2012-11-04T00:12:00")
    ];
    pairwise(dates, (d1, d2) => expect(chronoshift.minute.move(d1, tz, 3)).to.deep.equal(d2));
  });

  it("floors hour correctly", () => {
    expect(chronoshift.hour.floor(new Date("2012-11-04T00:30:00"), tz))
      .to.deep.equal(new Date("2012-11-04T00:00:00"));

    expect(chronoshift.hour.floor(new Date("2012-11-04T01:30:00"), tz))
      .to.deep.equal(new Date("2012-11-04T01:00:00"));

    expect(chronoshift.hour.floor(new Date("2012-11-04T01:30:00"), tz))
      .to.deep.equal(new Date("2012-11-04T01:00:00"));

    expect(chronoshift.hour.floor(new Date("2012-11-04T02:30:00"), tz))
      .to.deep.equal(new Date("2012-11-04T02:00:00"));

    expect(chronoshift.hour.floor(new Date("2012-11-04T03:30:00"), tz))
      .to.deep.equal(new Date("2012-11-04T03:00:00"));
  });

  it("moves hour", () => {
    var dates: Date[] = [
      new Date("2012-11-04T00:00:00"),
      new Date("2012-11-04T01:00:00"),
      new Date("2012-11-04T02:00:00"),
      new Date("2012-11-04T03:00:00")
    ];
    pairwise(dates, (d1, d2) => expect(chronoshift.hour.move(d1, tz, 1)).to.deep.equal(d2));
  });

  it("moves day", () => {
    var dates: Date[] = [
      new Date("2012-11-03T00:00:00"),
      new Date("2012-11-04T00:00:00"),
      new Date("2012-11-05T00:00:00"),
      new Date("2012-11-06T00:00:00")
    ];
    pairwise(dates, (d1, d2) => expect(chronoshift.day.move(d1, tz, 1)).to.deep.equal(d2));
  });

  it("moves week", () => {
    var dates: Date[] = [
      new Date("2012-10-29T00:00:00"),
      new Date("2012-11-05T00:00:00"),
      new Date("2012-11-12T00:00:00"),
      new Date("2012-11-19T00:00:00")
    ];
    pairwise(dates, (d1, d2) => expect(chronoshift.week.move(d1, tz, 1)).to.deep.equal(d2));
  });

  it("floors week correctly", () => {
    var d1 = new Date("2014-12-11T22:11:57.469Z");
    var d2 = new Date("2014-12-08T00:00:00.000Z");
    expect(chronoshift.week.floor(d1, tz)).to.eql(d2);

    d1 = new Date("2014-12-07T12:11:57.469Z");
    d2 = new Date("2014-12-01T00:00:00.000Z");
    expect(chronoshift.week.floor(d1, tz)).to.eql(d2);
  });

  it("ceils week correctly", () => {
    var d1 = new Date("2014-12-11T22:11:57.469Z");
    var d2 = new Date("2014-12-15T00:00:00.000Z");
    expect(chronoshift.week.ceil(d1, tz)).to.eql(d2);

    d1 = new Date("2014-12-07T12:11:57.469Z");
    d2 = new Date("2014-12-08T00:00:00.000Z");
    expect(chronoshift.week.ceil(d1, tz)).to.eql(d2);
  });

  it("moves month", () => {
    var dates: Date[] = [
      new Date("2012-11-01T00:00:00"),
      new Date("2012-12-01T00:00:00"),
      new Date("2013-01-01T00:00:00"),
      new Date("2013-02-01T00:00:00")
    ];
    pairwise(dates, (d1, d2) => expect(chronoshift.month.move(d1, tz, 1)).to.deep.equal(d2));
  });

  it("moves year", () => {
    var dates: Date[] = [
      new Date("2010-01-01T00:00:00"),
      new Date("2011-01-01T00:00:00"),
      new Date("2012-01-01T00:00:00"),
      new Date("2013-01-01T00:00:00")
    ];
    pairwise(dates, (d1, d2) => expect(chronoshift.year.move(d1, tz, 1)).to.deep.equal(d2));
  });
});
