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

import { testImmutableClass } from 'immutable-class-tester';

import { Timezone } from '../timezone/timezone';
import { Duration } from '../duration/duration';

describe("Duration", () => {
  let TZ_LA = Timezone.fromJS("America/Los_Angeles");
  let TZ_JUNEAU = Timezone.fromJS("America/Juneau");

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
      let durationStr: string;

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
      let vs = 'P1Y P5Y P10Y P100Y P1M P2M P3M P4M P1D'.split(' ');
      for (let v of vs) {
        expect(Duration.fromJS(v).isFloorable(), v).to.equal(true);
      }
    });

    it("works on not floorable things", () => {
      let vs = 'P1Y1M P5M P2D P3D'.split(' ');
      for (let v of vs) {
        expect(Duration.fromJS(v).isFloorable(), v).to.equal(false);
      }
    });
  });

  describe("#floor", () => {
    it("throws error if complex duration", () => {
      expect(() => Duration.fromJS("P1Y2D").floor(new Date(), TZ_LA)).to.throw(Error, "Can not floor on a complex duration");

      expect(() => Duration.fromJS("P3DT15H").floor(new Date(), TZ_LA)).to.throw(Error, "Can not floor on a complex duration");

      expect(() => Duration.fromJS("PT5H").floor(new Date(), TZ_LA)).to.throw(Error, "Can not floor on a hour duration that does not divide into 24");
    });

    it("works for year", () => {
      let p1y = Duration.fromJS("P1Y");
      expect(p1y.floor(new Date("2013-09-29T01:02:03.456-07:00"), TZ_LA)).to.deep.equal(new Date("2013-01-01T00:00:00.000-08:00"));
    });

    it("works for PT2M", () => {
      let pt2h = Duration.fromJS("PT2M");
      expect(pt2h.floor(new Date("2013-09-29T03:03:03.456-07:00"), TZ_LA)).to.deep.equal(new Date("2013-09-29T03:02:00.000-07:00"));
    });

    it("works for P2H", () => {
      let pt2h = Duration.fromJS("PT2H");
      expect(pt2h.floor(new Date("2013-09-29T03:02:03.456-07:00"), TZ_LA)).to.deep.equal(new Date("2013-09-29T02:00:00.000-07:00"));
    });

    it("works for PT12H", () => {
      let pt12h = Duration.fromJS("PT12H");
      expect(pt12h.floor(new Date("2015-09-12T13:05:00-08:00"), TZ_JUNEAU)).to.deep.equal(new Date("2015-09-12T12:00:00-08:00"));
    });

    it("works for P1W", () => {
      let p1w = Duration.fromJS("P1W");

      expect(p1w.floor(new Date("2013-09-29T01:02:03.456-07:00"), TZ_LA))
        .to.deep.equal(new Date("2013-09-23T07:00:00.000Z"));

      expect(p1w.floor(new Date("2013-10-03T01:02:03.456-07:00"), TZ_LA))
        .to.deep.equal(new Date("2013-09-30T00:00:00.000-07:00"));
    });

    it("works for P3M", () => {
      let p3m = Duration.fromJS("P3M");
      expect(p3m.floor(new Date("2013-09-29T03:02:03.456-07:00"), TZ_LA)).to.deep.equal(new Date("2013-07-01T00:00:00.000-07:00"));

      expect(p3m.floor(new Date("2013-02-29T03:02:03.456-07:00"), TZ_LA)).to.deep.equal(new Date("2013-01-01T00:00:00.000-08:00"));
    });

    it("works for P4Y", () => {
      let p4y = Duration.fromJS("P4Y");
      expect(p4y.floor(new Date("2013-09-29T03:02:03.456-07:00"), TZ_LA)).to.deep.equal(new Date("2012-01-01T00:00:00.000-08:00"));
    });

  });

  describe("#shift", () => {
    it("works for weeks", () => {
      let p1w: Duration;
      let p2w: Duration;

      p1w = Duration.fromJS("P1W");
      expect(p1w.shift(new Date("2012-10-29T00:00:00-07:00"), TZ_LA)).to.deep.equal(new Date("2012-11-05T00:00:00-08:00"));

      p1w = Duration.fromJS("P1W");
      expect(p1w.shift(new Date("2012-10-29T00:00:00-07:00"), TZ_LA, 2)).to.deep.equal(new Date("2012-11-12T00:00:00-08:00"));

      p2w = Duration.fromJS("P2W");
      expect(p2w.shift(new Date("2012-10-29T05:16:17-07:00"), TZ_LA)).to.deep.equal(new Date("2012-11-12T05:16:17-08:00"));
    });

    it("works for general complex case", () => {
      let pComplex = Duration.fromJS("P1Y2M3DT4H5M6S");
      expect(pComplex.shift(new Date("2012-01-01T00:00:00-08:00"), TZ_LA)).to.deep.equal(new Date("2013-03-04T04:05:06-08:00"));
    });
  });

  describe("#materialize", () => {
    it("works for weeks", () => {
      let p1w = Duration.fromJS("P1W");

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
      let p1w = Duration.fromJS("P1W");
      expect(p1w.isAligned(new Date("2012-10-29T00:00:00-07:00"), TZ_LA)).to.equal(true);
      expect(p1w.isAligned(new Date("2012-10-29T00:00:00-07:00"), Timezone.UTC)).to.equal(false);
    });

  });

  describe("#dividesBy", () => {
    it("works for true", () => {
      let vs = 'P5Y/P1Y P1D/P1D P1M/P1D P1W/P1D P1D/PT6H PT3H/PT1H'.split(' ');
      for (let v of vs) {
        let p = v.split('/');
        expect(Duration.fromJS(p[0]).dividesBy(Duration.fromJS(p[1])), v).to.equal(true);
      }
    });

    it("works for false", () => {
      let vs = 'P1D/P1M PT5H/PT1H'.split(' ');
      for (let v of vs) {
        let p = v.split('/');
        expect(Duration.fromJS(p[0]).dividesBy(Duration.fromJS(p[1])), v).to.equal(false);
      }
    });

  });

  describe("#getCanonicalLength", () => {
    it("gives back the correct canonical length", () => {
      let durationStr: string;

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
      let d1 = Duration.fromJS("P1D");
      let d2 = Duration.fromJS("P1D");

      expect(d1.add(d2).toJS()).to.eql("P2D");
    });

    it("works with heterogeneous spans", () => {
      let d1 = Duration.fromJS("P1D");
      let d2 = Duration.fromJS("P1Y");

      expect(d1.add(d2).toJS()).to.eql("P1Y1D");
    });

    it("works with weeks", () => {
      let d1 = Duration.fromJS("P1W");
      let d2 = Duration.fromJS("P2W");
      expect(d1.add(d2).toJS()).to.eql("P3W");

      d1 = Duration.fromJS("P6D");
      d2 = Duration.fromJS("P1D");
      expect(d1.add(d2).toJS()).to.eql("P1W");
    });
  });

  describe("#subtract()", () => {
    it("works with a simple duration", () => {
      let d1 = Duration.fromJS("P1DT2H");
      let d2 = Duration.fromJS("PT1H");

      expect(d1.subtract(d2).toJS()).to.eql("P1DT1H");
    });

    it("works with a less simple duration", () => {
      let d1 = Duration.fromJS("P1D");
      let d2 = Duration.fromJS("PT1H");

      expect(d1.subtract(d2).toJS()).to.eql("PT23H");
    });

    it("works with weeks", () => {
      let d1 = Duration.fromJS("P1W");
      let d2 = Duration.fromJS("P1D");

      expect(d1.subtract(d2).toJS()).to.eql("P6D");
    });

    it("throws an error if result is going to be negative", () => {
      let d1 = Duration.fromJS("P1D");
      let d2 = Duration.fromJS("P2D");

      expect(() => d1.subtract(d2)).to.throw();
    });
  });

  describe("#multiply()", () => {
    it("works with a simple duration", () => {
      var d = Duration.fromJS("P1D");
      expect(d.multiply(5).toJS()).to.eql("P5D");
    });

    it("works with a less simple duration", () => {
      var d = Duration.fromJS("P1DT2H");
      expect(d.multiply(2).toJS()).to.eql("P2DT4H");
    });

    it("works with weeks", () => {
      var d = Duration.fromJS("P1W");
      expect(d.multiply(5).toJS()).to.eql("P1M5D");
    });

    it("throws an error if result is going to be negative", () => {
      var d = Duration.fromJS("P1D");
      expect(() => d.multiply(-1)).to.throw('Multiplier must be positive non-zero');
    });

    it("gets description properly", () => {
      var d = Duration.fromJS("P2D");
      expect(d.multiply(2).getDescription(true)).to.equal("4 Days");
    });
  });



  describe("#getDescription()", () => {
    it("gives back the correct description", () => {
      let durationStr: string;

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

      durationStr = "P3DT15H";
      expect(Duration.fromJS(durationStr).getDescription(true)).to.equal('3 Days, 15 Hours');
    });
  });

  describe("#getSingleSpan()", () => {
    it("gives back the correct span", () => {
      let durationStr: string;

      durationStr = "P1D";
      expect(Duration.fromJS(durationStr).getSingleSpan()).to.equal('day');

      durationStr = "P3Y";
      expect(Duration.fromJS(durationStr).getSingleSpan()).to.equal('year');

      durationStr = "P2W";
      expect(Duration.fromJS(durationStr).getSingleSpan()).to.equal('week');

      durationStr = "PT5H";
      expect(Duration.fromJS(durationStr).getSingleSpan()).to.equal('hour');

      durationStr = "P3DT15H";
      expect(Duration.fromJS(durationStr).getSingleSpan()).to.equal(null);

      durationStr = "P3DT15H";
      expect(Duration.fromJS(durationStr).getSingleSpan()).to.equal(null);
    });
  });

  describe("#getSingleSpanValue()", () => {
    it("gives back the correct span value", () => {
      let durationStr: string;

      durationStr = "P1D";
      expect(Duration.fromJS(durationStr).getSingleSpanValue()).to.equal(1);

      durationStr = "P3Y";
      expect(Duration.fromJS(durationStr).getSingleSpanValue()).to.equal(3);

      durationStr = "P2W";
      expect(Duration.fromJS(durationStr).getSingleSpanValue()).to.equal(2);

      durationStr = "PT5H";
      expect(Duration.fromJS(durationStr).getSingleSpanValue()).to.equal(5);

      durationStr = "P3DT15H";
      expect(Duration.fromJS(durationStr).getSingleSpanValue()).to.equal(null);

      durationStr = "P3DT15H";
      expect(Duration.fromJS(durationStr).getSingleSpanValue()).to.equal(null);
    });
  });

});
