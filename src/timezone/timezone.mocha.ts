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

import { testImmutableClass } from '../../node_modules/immutable-class/build/tester';

import { Timezone } from '../timezone/timezone';

declare function require(file: string): any;
import { WallTime } from 'walltime-repack';
if (!WallTime.rules) {
  var tzData:any = require("../../lib/walltime/walltime-data.js");
  WallTime.init(tzData.rules, tzData.zones);
}

describe("Timezone", () => {
  it("is an immutable class", () => {
    testImmutableClass(Timezone, [
      "America/Los_Angeles",
      "Europe/Paris",
      "Etc/UTC"
    ]);
  });

  describe("errors", () => {
    it("throws error if invalid timezone", () => {
      expect(() => new Timezone("")).to.throw(Error, "Unable to find time zone named <blank>");

      expect(() => new Timezone("Blah/UTC")).to.throw(Error, "Unable to find time zone named Blah/UTC");

      expect(() => new Timezone("America/Lost_Angeles")).to.throw(Error, "Unable to find time zone named America/Lost_Angeles");
    });
  });

  describe("#toString", () => {
    it("gives back the correct string for LA", () => {
      var timezoneStr = "America/Los_Angeles";
      expect(new Timezone(timezoneStr).toString()).to.equal(timezoneStr);
    });

    it("gives back the correct string for UTC", () => {
      var timezoneStr = "Etc/UTC";
      expect(new Timezone(timezoneStr).toString()).to.equal(timezoneStr);
    });

    it("gives back the correct string for inbuilt UTC", () => {
      expect(Timezone.UTC.toString()).to.equal("Etc/UTC");
    });
  });

  describe("isTimezone", () => {
    it("gives back the correct string for LA", () => {
      var timezoneStr = "America/Los_Angeles";
      expect(Timezone.isTimezone(new Timezone(timezoneStr))).to.equal(true)
    });
  });

});
