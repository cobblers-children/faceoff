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
      expect(actual).to.have.length(1);
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
      expect(actual).to.have.length(0);
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
          significanceTest: {
            significant: false
          }
        },
      ];

      let actual = Util.findSlow([input]);
      expect(actual).to.have.length(0);
    });
  });

  describe("findInconclusive()", () => {
    it("handles empty results", () => {

    });

    it("finds inconclusive tests", () => {
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
          significanceTest: {
            significant: false
          }
        },
      ];

      let actual = Util.findInconclusive([input]);
      expect(actual).to.have.length(1);
    });

    it("finds inconclusive results versus non-baseline", () => {
      let input = [
        {
          name: 'foo ⇒ a',
          iterations: 200,
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
          significanceTest: {
            significant: false
          }
        },
        {
          name: 'foo ⇒ c',
          iterations: 200,
          slowest: true,
          histogram: {
            "samples": 12,
            "min": 1766.0067526089626,
            "max": 2096.9027705175117,
          },
          "opsSec": 1801.98778631387,
          significanceTest: {
            significant: true
          }
        },
      ];

      let actual = Util.findInconclusive([input]);
      expect(actual).to.have.length(1);
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
