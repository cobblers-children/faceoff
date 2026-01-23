import { describe, it, beforeEach } from "node:test";
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiString from 'chai-string';
import Util from "../../lib/util.js";

chai.use(chaiAsPromised);
chai.use(chaiString);

const expect = chai.expect;

describe("Util", () => {
  describe("analyze()", () => {
    let cleanSamples;
    let noisySamples;

    beforeEach(() => {
      cleanSamples = [...Array(40).keys().map((e) => e + 1000)];
      noisySamples = [...Array(40).keys().map((e) => e * 50 + 100)];
    });

    it("handles empty results", () => {
      const actual = Util.analyze([]);

      expect(actual).to.deep.equal({});
    });

    it("identifies inconclusive tests", () => {
      let input = [
        {
          name: 'foo ⇒ a',
          iterations: 200,
          fastest: true,
          baseline: true,
          plugins: [],
          histogram: {
            samples: 40,
            min: 1966.0067526089626,
            max: 2096.9027705175117,
            sampleData: cleanSamples
          },
          "opsSec": 1989.98778631387,
        },
        {
          name: 'foo ⇒ b',
          iterations: 200,
          slowest: true,
          plugins: [],
          histogram: {
            samples: 40,
            min: 1766.0067526089626,
            max: 2096.9027705175117,
            sampleData: noisySamples
          },
          "opsSec": 1801.98778631387,
        },
      ];

      let actual = Util.analyze([input]);
      expect(actual).to.be.an("object");
      expect(Object.keys(actual)).to.have.length(1);
      expect(actual).to.have.property("foo");
      expect(actual.foo[1]).to.have.property("inconclusive", true);
    });
  });

  describe("findSlow()", () => {
    it("handles empty results", () => {
      expect(() => Util.findSlow([])).not.to.throw();
    });

    it("finds slow tests", () => {
      let input = [
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
      ];

      let actual = Util.findSlow([input]);
      expect(Object.keys(actual)).to.have.length(1);
    });

    it("filters out fast tests", () => {
      let input = [
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
      ];

      let actual = Util.findSlow([input]);
      expect(Object.keys(actual)).to.have.length(0);
    });

    it("filters out inconclusive tests", () => {
      let input = [
        {
          name: 'foo ⇒ a',
          iterations: 200,
          fastest: true,
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
          slowest: true,
          histogram: {
            "samples": 12,
            "min": 1766.0067526089626,
            "max": 2096.9027705175117,
          },
          "opsSec": 1801.98778631387,
          inconclusive: true,
        },
      ];

      let actual = Util.findSlow([input]);
      expect(Object.keys(actual)).to.have.length(0);
    });
  });

  describe("findInconclusive()", () => {
    it("handles empty results", () => {
      let actual = Util.findInconclusive([]);
      expect(actual).to.deep.equal({});
    });

    it("finds inconclusive tests", () => {
      let input = [
        {
          name: 'foo ⇒ a',
          iterations: 200,
          fastest: true,
          baseline: true,
          opsSec: 1989.98778631387,
        },
        {
          name: 'foo ⇒ b',
          iterations: 200,
          slowest: true,
          opsSec: 1801.98778631387,
          inconclusive: true,
        },
      ];

      let actual = Util.findInconclusive([input]);
      expect(Object.keys(actual)).to.have.length(1);
    });
  });

  describe("toString()", () => {
    it("handles empty results", () => {
      expect(() => Util.toString([])).not.to.throw();
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

      expect(() => Util.toString(input)).not.to.throw();
    });

    it("formats the output", () => {
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

      let actual = Util.toString(input);
      expect(actual).to.include("Node.js version:");
      expect(actual).to.include("Performance Regressions:");
    });
  });

  describe("analyze()", () => {
    it("handles empty results", async () => {
      let result = Util.analyze([]);

      expect(result).to.deep.equal({});
    });

    it("generates well-formed results", async () => {
      let result = Util.analyze([
        [
          {
            name: 'foo ⇒ a',
            iterations: 200,
            fastest: true,
            histogram: {
              "samples": 6,
              "sampleData": [1964,1965,1966,1967,1968,1969],
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
              "samples": 6,
              "sampleData": [1766,1865,1966,1967,1968,1969],
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

      expect(result).to.have.property('foo');
    });
  });
});
