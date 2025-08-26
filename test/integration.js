import { describe, it } from "node:test";
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiString from 'chai-string';
import Util from "../lib/util.js";

chai.use(chaiAsPromised);
chai.use(chaiString);

const expect = chai.expect;

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

  describe("install()", () => {
    it("handles packages with slashes", async () => {
      let result = await Util.install("@babel/core@latest", "@babel/core@latest");

      expect(result.module).to.be.an("object");
      expect(result.location).to.endWith("/node_modules/@babel/core");
    });
  });
});
