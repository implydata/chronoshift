/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../build/chronoshift.d.ts" />
"use strict";

declare function require(file: string): any;

import chai = require("chai");
import expect = chai.expect;

import ImmutableClassTesterModule = require("../node_modules/immutable-class/build/tester");

var chronoshift = <typeof Chronoshift>require("../build/chronoshift");
var Timezone = chronoshift.Timezone;

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
