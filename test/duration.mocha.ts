/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../typings/chai/chai.d.ts" />
/// <reference path="../build/chronoshift.d.ts" />

import { expect } from "chai";

declare function require(file: string): any;

import ImmutableClassTesterModule = require("../node_modules/immutable-class/build/tester");
import testImmutableClass = ImmutableClassTesterModule.testImmutableClass;

var chronoshift = <typeof Chronoshift>require("../build/chronoshift");
var Timezone = chronoshift.Timezone;
var Duration = chronoshift.Duration;

if (!chronoshift.WallTime.rules) {
  var tzData:any = require("../lib/walltime/walltime-data.js");
  chronoshift.WallTime.init(tzData.rules, tzData.zones);
}

describe("Duration", () => {
  var TZ_LA = Timezone.fromJS("America/Los_Angeles");
  var TZ_JUNEAU = Timezone.fromJS("America/Juneau");

  it("is an immutable class", () => {
    testImmutableClass(Duration, [
      "P1D",
      "P2D",
      "P6DT24H59M59S",
      "P1W",
      "P3DT15H"
    ]);
  });

  describe("errors", () => {
    it("throws error if invalid duration", () => {
      expect(() => Duration.fromJS("")).to.throw(Error, "Can not parse duration ''");

      expect(() => Duration.fromJS("P00")).to.throw(Error, "Can not parse duration 'P00'");

      expect(() => Duration.fromJS("P")).to.throw(Error, "Duration can not be empty");

      expect(() => Duration.fromJS("P0YT0H")).to.throw(Error, "Duration can not be empty");

      expect(() => Duration.fromJS("P0W").shift(new Date(), TZ_LA)).to.throw(Error, "Duration can not be empty");

      expect(() => Duration.fromJS("P0Y0MT0H0M0S").shift(new Date(), TZ_LA)).to.throw(Error, "Duration can not be empty");
    });

    it("throws error if fromJS is not given a string", () => {
      expect(() => Duration.fromJS((<any>new Date()))).to.throw(Error, "Duration JS must be a string");
    });
  });

  describe("#toString", () => {
    it("gives back the correct string", () => {
      var durationStr;
      durationStr = "P3Y";
      expect(Duration.fromJS(durationStr).toString()).to.equal(durationStr);

      durationStr = "P2W";
      expect(Duration.fromJS(durationStr).toString()).to.equal(durationStr);

      durationStr = "PT5H";
      expect(Duration.fromJS(durationStr).toString()).to.equal(durationStr);

      durationStr = "P3DT15H";
      expect(Duration.fromJS(durationStr).toString()).to.equal(durationStr);
    });

    it("eliminates 0", () => {
      expect(Duration.fromJS("P0DT15H").toString()).to.equal("PT15H")
    });
  });

  describe("fromCanonicalLength", () => {
    it("works", () => {
      expect(Duration.fromCanonicalLength(86400000).toJS()).to.eql("P1D");
    });
  });

  describe("construct from span", () => {
    it("parses days over DST", () => {
      expect(new Duration(
        new Date("2012-10-29T00:00:00-07:00"),
        new Date("2012-11-05T00:00:00-08:00"),
        TZ_LA
      ).toString()).to.equal("P7D");

      expect(new Duration(
        new Date("2012-10-29T00:00:00-07:00"),
        new Date("2012-11-12T00:00:00-08:00"),
        TZ_LA
      ).toString()).to.equal("P14D");
    });

    it("parses complex case", () => {
      expect(new Duration(
        new Date("2012-10-29T00:00:00-07:00"),
        new Date(new Date("2012-11-05T00:00:00-08:00").valueOf() - 1000),
        TZ_LA
      ).toString()).to.equal("P6DT23H59M59S");

      expect(new Duration(
        new Date("2012-01-01T00:00:00-08:00"),
        new Date("2013-03-04T04:05:06-08:00"),
        TZ_LA
      ).toString()).to.equal("P1Y2M3DT4H5M6S");
    });
  });

  describe("#isFloorable", () => {
    it("works on floorable things", () => {
      var vs = 'P1Y P5Y P10Y P100Y P1M P2M P3M P4M P1D'.split(' ');
      for (var v of vs) {
        expect(Duration.fromJS(v).isFloorable(), v).to.equal(true);
      }
    });

    it("works on not floorable things", () => {
      var vs = 'P1Y1M P5M P2D P3D'.split(' ');
      for (var v of vs) {
        expect(Duration.fromJS(v).isFloorable(), v).to.equal(false);
      }
    });
  });

  describe("#floor", () => {
    it("throws error if complex duration", () => {
      expect(() => Duration.fromJS("P1Y2D").floor(new Date(), TZ_LA)).to.throw(Error, "Can not floor on a complex duration");

      expect(() => Duration.fromJS("P3DT15H").floor(new Date(), TZ_LA)).to.throw(Error, "Can not floor on a complex duration");

      expect(() => Duration.fromJS("PT5H").floor(new Date(), TZ_LA)).to.throw(Error, "Can not floor on a hour duration that is not a multiple of 5");
    });

    it("works for year", () => {
      var p1y = Duration.fromJS("P1Y");
      expect(p1y.floor(new Date("2013-09-29T01:02:03.456-07:00"), TZ_LA)).to.deep.equal(new Date("2013-01-01T00:00:00.000-08:00"));
    });

    it("works for PT2M", () => {
      var pt2h = Duration.fromJS("PT2M");
      expect(pt2h.floor(new Date("2013-09-29T03:03:03.456-07:00"), TZ_LA)).to.deep.equal(new Date("2013-09-29T03:02:00.000-07:00"));
    });

    it("works for P2H", () => {
      var pt2h = Duration.fromJS("PT2H");
      expect(pt2h.floor(new Date("2013-09-29T03:02:03.456-07:00"), TZ_LA)).to.deep.equal(new Date("2013-09-29T02:00:00.000-07:00"));
    });

    it("works for PT12H", () => {
      var pt12h = Duration.fromJS("PT12H");
      expect(pt12h.floor(new Date("2015-09-12T13:05:00-08:00"), TZ_JUNEAU)).to.deep.equal(new Date("2015-09-12T12:00:00-08:00"));
    });

    it("works for P1W", () => {
      var p1w = Duration.fromJS("P1W");

      expect(p1w.floor(new Date("2013-09-29T01:02:03.456-07:00"), TZ_LA))
        .to.deep.equal(new Date("2013-09-23T07:00:00.000Z"));

      expect(p1w.floor(new Date("2013-10-03T01:02:03.456-07:00"), TZ_LA))
        .to.deep.equal(new Date("2013-09-30T00:00:00.000-07:00"));
    });

    it("works for P3M", () => {
      var p3m = Duration.fromJS("P3M");
      expect(p3m.floor(new Date("2013-09-29T03:02:03.456-07:00"), TZ_LA)).to.deep.equal(new Date("2013-07-01T00:00:00.000-07:00"));

      expect(p3m.floor(new Date("2013-02-29T03:02:03.456-07:00"), TZ_LA)).to.deep.equal(new Date("2013-01-01T00:00:00.000-08:00"));
    });

    it("works for P4Y", () => {
      var p4y = Duration.fromJS("P4Y");
      expect(p4y.floor(new Date("2013-09-29T03:02:03.456-07:00"), TZ_LA)).to.deep.equal(new Date("2012-01-01T00:00:00.000-08:00"));
    });

  });

  describe("#shift", () => {
    it("works for weeks", () => {
      var p1w, p2w;
      p1w = Duration.fromJS("P1W");
      expect(p1w.shift(new Date("2012-10-29T00:00:00-07:00"), TZ_LA)).to.deep.equal(new Date("2012-11-05T00:00:00-08:00"));

      p1w = Duration.fromJS("P1W");
      expect(p1w.shift(new Date("2012-10-29T00:00:00-07:00"), TZ_LA, 2)).to.deep.equal(new Date("2012-11-12T00:00:00-08:00"));

      p2w = Duration.fromJS("P2W");
      expect(p2w.shift(new Date("2012-10-29T05:16:17-07:00"), TZ_LA)).to.deep.equal(new Date("2012-11-12T05:16:17-08:00"));
    });

    it("works for general complex case", () => {
      var pComplex = Duration.fromJS("P1Y2M3DT4H5M6S");
      expect(pComplex.shift(new Date("2012-01-01T00:00:00-08:00"), TZ_LA)).to.deep.equal(new Date("2013-03-04T04:05:06-08:00"));
    });
  });

  describe("#materialize", () => {
    it("works for weeks", () => {
      var p1w = Duration.fromJS("P1W");

      expect(p1w.materialize(new Date("2012-10-29T00:00:00-07:00"), new Date("2012-12-01T00:00:00-08:00"), TZ_LA)).to.deep.equal([
        new Date('2012-10-29T07:00:00.000Z'),
        new Date('2012-11-05T08:00:00.000Z'),
        new Date('2012-11-12T08:00:00.000Z'),
        new Date('2012-11-19T08:00:00.000Z'),
        new Date('2012-11-26T08:00:00.000Z')
      ]);

      expect(p1w.materialize(new Date("2012-10-29T00:00:00-07:00"), new Date("2012-12-01T00:00:00-08:00"), TZ_LA, 2)).to.deep.equal([
        new Date('2012-10-29T07:00:00.000Z'),
        new Date('2012-11-12T08:00:00.000Z'),
        new Date('2012-11-26T08:00:00.000Z')
      ]);
    });

  });

  describe("#isAligned", () => {
    it("works for weeks", () => {
      var p1w = Duration.fromJS("P1W");
      expect(p1w.isAligned(new Date("2012-10-29T00:00:00-07:00"), TZ_LA)).to.equal(true);
      expect(p1w.isAligned(new Date("2012-10-29T00:00:00-07:00"), Timezone.UTC)).to.equal(false);
    });

  });

  describe("#dividesBy", () => {
    it("works for true", () => {
      var vs = 'P5Y/P1Y P1D/P1D P1M/P1D P1W/P1D P1D/PT6H PT3H/PT1H'.split(' ');
      for (var v of vs) {
        var p = v.split('/');
        expect(Duration.fromJS(p[0]).dividesBy(Duration.fromJS(p[1])), v).to.equal(true);
      }
    });

    it("works for false", () => {
      var vs = 'P1D/P1M PT5H/PT1H'.split(' ');
      for (var v of vs) {
        var p = v.split('/');
        expect(Duration.fromJS(p[0]).dividesBy(Duration.fromJS(p[1])), v).to.equal(false);
      }
    });

  });

  describe("#getCanonicalLength", () => {
    it("gives back the correct canonical length", () => {
      var durationStr;
      durationStr = "P3Y";
      expect(Duration.fromJS(durationStr).getCanonicalLength()).to.equal(94608000000);

      durationStr = "P2W";
      expect(Duration.fromJS(durationStr).getCanonicalLength()).to.equal(1209600000);

      durationStr = "PT5H";
      expect(Duration.fromJS(durationStr).getCanonicalLength()).to.equal(18000000);

      durationStr = "P3DT15H";
      expect(Duration.fromJS(durationStr).getCanonicalLength()).to.equal(313200000);
    });
  });

  describe("#add()", () => {
    it("works with a simple duration", () => {
      var d1 = Duration.fromJS("P1D");
      var d2 = Duration.fromJS("P1D");

      expect(d1.add(d2).toJS()).to.eql("P2D");
    });

    it("works with heterogeneous spans", () => {
      var d1 = Duration.fromJS("P1D");
      var d2 = Duration.fromJS("P1Y");

      expect(d1.add(d2).toJS()).to.eql("P1Y1D");
    });

    it("works with weeks", () => {
      var d1 = Duration.fromJS("P1W");
      var d2 = Duration.fromJS("P2W");
      expect(d1.add(d2).toJS()).to.eql("P3W");

      d1 = Duration.fromJS("P6D");
      d2 = Duration.fromJS("P1D");
      expect(d1.add(d2).toJS()).to.eql("P1W");
    });
  });

  describe("#subtract()", () => {
    it("works with a simple duration", () => {
      var d1 = Duration.fromJS("P1DT2H");
      var d2 = Duration.fromJS("PT1H");

      expect(d1.subtract(d2).toJS()).to.eql("P1DT1H");
    });

    it("works with a less simple duration", () => {
      var d1 = Duration.fromJS("P1D");
      var d2 = Duration.fromJS("PT1H");

      expect(d1.subtract(d2).toJS()).to.eql("PT23H");
    });

    it("works with weeks", () => {
      var d1 = Duration.fromJS("P1W");
      var d2 = Duration.fromJS("P1D");

      expect(d1.subtract(d2).toJS()).to.eql("P6D");
    });

    it("throws an error if result is going to be negative", () => {
      var d1 = Duration.fromJS("P1D");
      var d2 = Duration.fromJS("P2D");

      expect(() => d1.subtract(d2)).to.throw();
    });
  });


  describe("#getDescription()", () => {
    it("gives back the correct description", () => {
      var durationStr;
      durationStr = "P1D";
      expect(Duration.fromJS(durationStr).getDescription()).to.equal('day');

      durationStr = "P3Y";
      expect(Duration.fromJS(durationStr).getDescription()).to.equal('3 years');

      durationStr = "P2W";
      expect(Duration.fromJS(durationStr).getDescription()).to.equal('2 weeks');

      durationStr = "PT5H";
      expect(Duration.fromJS(durationStr).getDescription()).to.equal('5 hours');

      durationStr = "P3DT15H";
      expect(Duration.fromJS(durationStr).getDescription()).to.equal('3 days, 15 hours');
    });
  });
});
