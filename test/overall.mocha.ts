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

/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../typings/chai/chai.d.ts" />
/// <reference path="../build/chronoshift.d.ts" />

import { expect } from "chai";

declare function require(file: string): any;

import ImmutableClassTesterModule = require("../node_modules/immutable-class/build/tester");

var chronoshift = <typeof Chronoshift>require("../build/chronoshift");
var Timezone = chronoshift.Timezone;

if (!chronoshift.WallTime.rules) {
  var tzData:any = require("../lib/walltime/walltime-data.js");
  chronoshift.WallTime.init(tzData.rules, tzData.zones);
}

describe("Overall", () => {
  it("can find Timezone", () => {
    expect(Timezone.fromJS("America/Los_Angeles").toJS()).to.equal("America/Los_Angeles");
  });

  describe("isDate", () => {
    it("works", () => {
      expect(chronoshift.isDate(new Date)).to.equal(true);
      expect(chronoshift.isDate([])).to.equal(false);
    });
  });
});
