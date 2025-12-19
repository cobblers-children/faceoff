import { describe, it } from "node:test";
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiString from 'chai-string';
import Util from "../../lib/util.js";

chai.use(chaiAsPromised);
chai.use(chaiString);

const expect = chai.expect;

describe("Util", () => {
  describe("findSlow()", () => {
    it("handles empty results", () => {
      expect(() => Util.findSlow([])).not.to.throw();
    });

    it("finds slow tests", () => {
      let input = [
        [
          {
            name: 'foo ⇒ a',
            iterations: 200,
            fastest: true,
            histogram: {
              "samples": 11,
              "min": 1966.0067526089626,
              "max": 2096.9027705175117,
            },
            "opsSec": 1989.98778631387,
          },
          {
            name: 'foo ⇒ b',
            iterations: 200,
            slowest: true,
            histogram: {
              "samples": 12,
              "min": 1766.0067526089626,
              "max": 2096.9027705175117,
            },
            "opsSec": 1801.98778631387,
          },
        ]
      ];

      let actual = Util.findSlow(input);
      expect(actual).to.have.length(1);
    });

    it("filters out fast tests", () => {
      let input = [
        [
          {
            name: 'foo ⇒ a',
            iterations: 200,
            slowest: true,
            baseline: true,
            histogram: {
              "samples": 11,
              "min": 1966.0067526089626,
              "max": 2096.9027705175117,
            },
            "opsSec": 1989.98778631387,
          },
          {
            name: 'foo ⇒ b',
            iterations: 200,
            fastest: true,
            histogram: {
              "samples": 12,
              "min": 1766.0067526089626,
              "max": 2096.9027705175117,
            },
            "opsSec": 1801.98778631387,
          },
        ]
      ];

      let actual = Util.findSlow(input);
      expect(actual).to.have.length(0);
    });
  });

  describe("chartReport()", () => {
    it("handles empty results", () => {
      expect(() => Util.chartResults([])).not.to.throw();
    });

    it("handles results", () => {
      let input = [
        [
          {
            name: 'foo ⇒ a',
            iterations: 200,
            fastest: true,
            histogram: {
              "samples": 11,
              "min": 1966.0067526089626,
              "max": 2096.9027705175117,
            },
            "opsSec": 1989.98778631387,
          },
          {
            name: 'foo ⇒ b',
            iterations: 200,
            slowest: true,
            histogram: {
              "samples": 12,
              "min": 1766.0067526089626,
              "max": 2096.9027705175117,
            },
            "opsSec": 1801.98778631387,
          },
        ]
      ];

      expect(() => Util.chartResults(input)).not.to.throw();
    });
  });

  describe("toJSON()", () => {
    it("handles empty results", async () => {
      let result = Util.toJSON([]);

      expect(result).to.equal("{}");
    });

    it("generates well-formed results", async () => {
      let result = Util.toJSON([
        [
          {
            name: 'foo ⇒ a',
            iterations: 200,
            fastest: true,
            histogram: {
              "samples": 11,
              "min": 1966.0067526089626,
              "max": 2096.9027705175117,
            },
            "opsSec": 1989.98778631387,
            "plugins": [
              "v8-never-optimize=true"
            ],
          },
          {
            name: 'foo ⇒ b',
            iterations: 200,
            slowest: true,
            histogram: {
              "samples": 12,
              "min": 1766.0067526089626,
              "max": 2096.9027705175117,
            },
            "opsSec": 1801.98778631387,
            "plugins": [
              "v8-never-optimize=true"
            ],
          },
        ]
      ]);

      let actual = JSON.parse(result);

      expect(actual).to.have.property('foo');
    });
  });
});
