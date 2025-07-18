import { describe, it } from "node:test";
import { expect } from "chai";
import Util from "../lib/util.js";

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
});
