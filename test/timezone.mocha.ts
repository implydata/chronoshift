/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../build/chronoshift.d.ts" />
"use strict";

declare function require(file: string): any;

import chai = require("chai");
import expect = chai.expect;

import ImmutableClassTesterModule = require("../node_modules/immutable-class/build/tester");
import testImmutableClass = ImmutableClassTesterModule.testImmutableClass;

var chronoshift = <typeof Chronoshift>require("../build/chronoshift");
var Timezone = chronoshift.Timezone;

if (!chronoshift.WallTime.rules) {
  var tzData:any = require("../lib/walltime/walltime-data.js");
  chronoshift.WallTime.init(tzData.rules, tzData.zones);
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
