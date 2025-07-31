import { describe, it } from "node:test";
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Util from "../lib/util.js";

chai.use(chaiAsPromised);

const expect = chai.expect;

describe("Util", () => {
  describe("packageName()", () => {
    it("exists", () => {
      expect(Util.packageName).to.exist;
    });

    it("handles packages with slashes", () => {
      expect(Util.packageName("@babel/core@latest")).to.equal("@babel/core");
    });

    it("handles packages without organizations", () => {
      expect(Util.packageName("core@latest")).to.equal("core");
    });

    it("handles packages without version number organizations", () => {
      expect(Util.packageName("@babel/core")).to.equal("@babel/core");
    });
  });

  describe("headingName()", () => {
    it("exists", () => {
      expect(Util.headingName).to.exist;
    });

    it("grabs everything to the last arrow", () => {
      let testName = "example ⇒ suite name ⇒ nested suite name ⇒ scenario name"

      expect(Util.headingName("a ⇒ b")).to.equal("a");
      expect(Util.headingName(testName)).to.equal("example ⇒ suite name ⇒ nested suite name");
    });
  });

  describe('asyncExec()', () => {
    it("exists", () => {
      expect(Util.asyncExec).to.exist;
    });

    it("resolves on commands", async () => {
      await expect(Util.asyncExec('ls -la')).to.eventually.include("package-lock.json");
    });

    it("rejects on errors", async () => {
      await expect(Util.asyncExec('ls missing_file')).to.be.rejectedWith("Command failed");
    });
  });

  describe('findSlow()', () => {
    it("exists", () => {
      expect(Util.findSlow).to.exist;
    });

    it("handles empty set", () => {
      expect(() => Util.findSlow()).not.to.throw();
    });

    it("ignores small discrepancies", () => {
      let actual = Util.findSlow([
        [{ opsSec: 22, fastest: true }, { opsSec: 20 }, { opsSec: 21, slowest: true }]
      ]);

      expect(actual).to.be.empty;
    });

    it("finds regressions", () => {
      let actual = Util.findSlow([
        [{ opsSec: 20, slowest: true }, { opsSec: 20 }, { opsSec: 21, fastest: true }],
        [{ opsSec: 21, fastest: true }, { opsSec: 20 }, { opsSec: 18.5, slowest: true }]
      ]);

      expect(actual).have.lengthOf(1);
      expect(actual[0][2]).to.deep.equal({ opsSec: 18.5, slowest: true });
    });
  });
});
