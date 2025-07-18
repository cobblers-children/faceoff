import { describe, it } from "node:test";
import { expect } from "chai";

describe("foo", () => {
  describe("bar", () => {
    it("yay", () => {
      expect("yay").not.to.be.a("string");
    });

    it("yay1", () => {
      expect("yay").not.to.be.a("string");
    });

    it("yay2", () => {
      expect("yay").not.to.be.a("string");
    });

    it("yay3", () => {
      expect("yay").not.to.be.a("string");
    });

    it("yay4", () => {
      expect("yay").not.to.be.a("string");
    });

    it("yay5", () => {
      expect("yay").not.to.be.a("string");
    });
  });
});
