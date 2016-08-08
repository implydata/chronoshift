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

import { expect } from "chai";

import { Timezone } from '../timezone/timezone';
import { shifters } from './floor-shift-ceil'

declare function require(file: string): any;
import { WallTime } from 'walltime-repack';
if (!WallTime.rules) {
  var tzData:any = require("../../lib/walltime/walltime-data.js");
  WallTime.init(tzData.rules, tzData.zones);
}

function pairwise<T>(array: T[], callback: (t1: T, t2: T) => void) {
  for (var i = 0; i < array.length - 1; i++) {
    callback(array[i], array[i + 1])
  }
}

describe("floor/shift/ceil", () => {
  var tz = new Timezone("America/Los_Angeles");

  it("shifts seconds", () => {
    var dates: Date[] = [
      new Date("2012-11-04T00:00:00-07:00"),
      new Date("2012-11-04T00:00:03-07:00"),
      new Date("2012-11-04T00:00:06-07:00"),
      new Date("2012-11-04T00:00:09-07:00"),
      new Date("2012-11-04T00:00:12-07:00")
    ];
    pairwise(dates, (d1, d2) => expect(shifters.second.shift(d1, tz, 3)).to.deep.equal(d2));
  });

  it("shifts minutes", () => {
    var dates: Date[] = [
      new Date("2012-11-04T00:00:00-07:00"),
      new Date("2012-11-04T00:03:00-07:00"),
      new Date("2012-11-04T00:06:00-07:00"),
      new Date("2012-11-04T00:09:00-07:00"),
      new Date("2012-11-04T00:12:00-07:00")
    ];
    pairwise(dates, (d1, d2) => expect(shifters.minute.shift(d1, tz, 3)).to.deep.equal(d2));
  });

  it("floors hour correctly", () => {
    expect(shifters.hour.floor(new Date("2012-11-04T00:30:00-07:00"), tz))
      .to.deep.equal(new Date("2012-11-04T00:00:00-07:00"), 'A');

    expect(shifters.hour.floor(new Date("2012-11-04T01:30:00-07:00"), tz))
      .to.deep.equal(new Date("2012-11-04T01:00:00-08:00"), 'B');

    expect(shifters.hour.floor(new Date("2012-11-04T01:30:00-08:00"), tz))
      .to.deep.equal(new Date("2012-11-04T01:00:00-08:00"), 'C');

    expect(shifters.hour.floor(new Date("2012-11-04T02:30:00-08:00"), tz))
      .to.deep.equal(new Date("2012-11-04T02:00:00-08:00"), 'D');

    expect(shifters.hour.floor(new Date("2012-11-04T03:30:00-08:00"), tz))
      .to.deep.equal(new Date("2012-11-04T03:00:00-08:00"), 'E');
  });

  it("shifts hour over DST", () => {
    var dates: Date[] = [
      new Date("2012-11-04T00:00:00-07:00"),
      new Date("2012-11-04T01:00:00-08:00"),
      new Date("2012-11-04T02:00:00-08:00"),
      new Date("2012-11-04T03:00:00-08:00")
    ];
    pairwise(dates, (d1, d2) => expect(shifters.hour.shift(d1, tz, 1)).to.deep.equal(d2));
  });

  it("shifts day over DST", () => {
    var dates: Date[] = [
      new Date("2012-11-03T00:00:00-07:00"),
      new Date("2012-11-04T00:00:00-07:00"),
      new Date("2012-11-05T00:00:00-08:00"),
      new Date("2012-11-06T00:00:00-08:00")
    ];
    pairwise(dates, (d1, d2) => expect(shifters.day.shift(d1, tz, 1)).to.deep.equal(d2));
  });

  it("shifts week over DST", () => {
    var dates: Date[] = [
      new Date("2012-10-29T00:00:00-07:00"),
      new Date("2012-11-05T00:00:00-08:00"),
      new Date("2012-11-12T00:00:00-08:00"),
      new Date("2012-11-19T00:00:00-08:00")
    ];
    pairwise(dates, (d1, d2) => expect(shifters.week.shift(d1, tz, 1)).to.deep.equal(d2));
  });

  it("floors week correctly", () => {
    var d1 = new Date("2014-12-11T22:11:57.469Z");
    var d2 = new Date("2014-12-08T08:00:00.000Z");
    expect(shifters.week.floor(d1, tz)).to.eql(d2);

    d1 = new Date("2014-12-07T12:11:57.469Z");
    d2 = new Date("2014-12-01T08:00:00.000Z");
    expect(shifters.week.floor(d1, tz)).to.eql(d2);
  });

  it("ceils week correctly", () => {
    var d1 = new Date("2014-12-11T22:11:57.469Z");
    var d2 = new Date("2014-12-15T08:00:00.000Z");
    expect(shifters.week.ceil(d1, tz)).to.eql(d2);

    d1 = new Date("2014-12-07T12:11:57.469Z");
    d2 = new Date("2014-12-08T08:00:00.000Z");
    expect(shifters.week.ceil(d1, tz)).to.eql(d2);
  });

  it("shifts month over DST", () => {
    var dates: Date[] = [
      new Date("2012-11-01T00:00:00-07:00"),
      new Date("2012-12-01T00:00:00-08:00"),
      new Date("2013-01-01T00:00:00-08:00"),
      new Date("2013-02-01T00:00:00-08:00")
    ];
    pairwise(dates, (d1, d2) => expect(shifters.month.shift(d1, tz, 1)).to.deep.equal(d2));
  });

  it("shifts year", () => {
    var dates: Date[] = [
      new Date("2010-01-01T00:00:00-08:00"),
      new Date("2011-01-01T00:00:00-08:00"),
      new Date("2012-01-01T00:00:00-08:00"),
      new Date("2013-01-01T00:00:00-08:00")
    ];
    pairwise(dates, (d1, d2) => expect(shifters.year.shift(d1, tz, 1)).to.deep.equal(d2));
  });
});
