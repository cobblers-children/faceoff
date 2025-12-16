import { describe, it } from "node:test";
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiString from 'chai-string';
import Util from "../lib/util.js";

chai.use(chaiAsPromised);
chai.use(chaiString);

const expect = chai.expect;

describe("Util", () => {
  describe("chartReport()", () => {
    it("handles empty results", () => {
      expect(() => Util.chartResults([])).not.to.throw();
    });

    it("handles results", () => {
      let result = Util.chartResults([
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
      ]);
    });
  });

  describe("toJSON()", () => {
    it("handles empty results", async () => {
      let result = Util.toJSON([]);

      expect(result).to.equal("{}");
    });

    it("generates out results", async () => {
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

describe("Util integration", () => {
  describe("chartReport()", () => {
    it("handles empty results", () => {
      expect(() => Util.chartResults([])).not.to.throw();
    });

    it("handles results", () => {
      let result = Util.chartResults([
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
      ]);
    });
  });

  describe("toJSON()", () => {
    it("handles empty results", async () => {
      let result = Util.toJSON([]);

      expect(result).to.equal("{}");
    });

    it("generates out results", async () => {
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
