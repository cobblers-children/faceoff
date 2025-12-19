import Path from "path";
import { mkdtemp } from 'node:fs/promises';
import fs from "node:fs";
import {tmpdir} from "node:os";
import { beforeEach, describe, it } from "node:test";
import chai from 'chai';
import spies from "chai-spies";
import chaiAsPromised from 'chai-as-promised';
import chaiString from 'chai-string';
import Faceoff from "../../lib/index.js";

chai.use(chaiAsPromised);
chai.use(chaiString);
chai.use(spies);

const expect = chai.expect;

describe("Faceoff integration tests", () => {
  describe("instance functions", () => {
    let benchmark;

    beforeEach(() => {
      benchmark = new Faceoff({ currentVersion: { location: "." } });
    });

    describe("outputResults()", () => {
      beforeEach(async () => {
        benchmark.add("test1", () => {});

        benchmark.suite("group 1", (suite) => {
          benchmark.add("test1", () => {});
          benchmark.add("test2", () => {});
          benchmark.add("test 🔥", () => {});
        });

        await benchmark.run();
      });

      it("generates valid JSON", async () => {
        JSON.parse(await benchmark.outputResults());
      });

      it("enumerates the tests as a tree", async () => {
        let results = JSON.parse(await benchmark.outputResults());

        expect(results).to.have.property("group 1 ⇒ test1");
        expect(results).to.have.property("group 1 ⇒ test2");

        expect(results).to.have.property("test1");
        expect(results["test1"]).to.be.length(1);
        expect(results["test1"][0]).to.have.property("name", " ⇒ currentVersion");
        expect(results["test1"][0]).to.have.property("runsSampled");
        expect(results["test1"][0]).to.have.property("min");
        expect(results["test1"][0]).to.have.property("max");
        expect(results["test1"][0]).to.have.property("opsSec");
      });

      describe("disk output", async () => {
        let location;

        beforeEach(async () => {
          const tempDirName = await mkdtemp(Path.join(tmpdir(), 'faceoff-test-'));
          location = Path.join(tempDirName, "output.json");
        });

        it("can output the file to a specific location", async () => {
          JSON.parse(await benchmark.outputResults(location));

          await expect(fs.existsSync(location)).to.be.true;
        });

        it("contains a valid output", async () => {
          await benchmark.outputResults(location);

          const results = JSON.parse(fs.readFileSync(location, "utf8"));

          expect(results).to.have.property("group 1 ⇒ test1");
        });

        it("Encodes unicode properly", async () => {
          await benchmark.outputResults(location);

          const results = JSON.parse(fs.readFileSync(location, "utf8"));

          expect(results).to.have.property("group 1 ⇒ test 🔥");
        });
      });
    });
  });
});
