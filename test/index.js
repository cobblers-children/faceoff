import Path from "path";
import { mkdtemp } from 'node:fs/promises';
import fs from "node:fs";
import {tmpdir} from "node:os";
import { beforeEach, describe, it } from "node:test";
import chai from 'chai';
import spies from "chai-spies";
import chaiAsPromised from 'chai-as-promised';
import chaiString from 'chai-string';
import Faceoff from "../lib/index.js";

chai.use(chaiAsPromised);
chai.use(chaiString);
chai.use(spies);

const expect = chai.expect;

describe("faceoff", () => {
  describe("constructor", () => {
    it("handles an empty set", () => {
      new Faceoff();
    });
  });

  describe("instance functions", () => {
    let benchmark;

    beforeEach(() => {
      benchmark = new Faceoff({ currentVersion: { location: "." } });
    });

    describe("add()", () => {
      it("can handle direct calls", () => {
        benchmark.add("naked1", () => {
        });
        benchmark.add("naked2", () => {
        });

        expect(benchmark.suites).to.have.length(2);
      });

      it("passes options along to bench-node", () => {
        let badOptions = {minSamples: "blue"};

        expect(() => benchmark.add("topLevel", () => {
        }, badOptions)).to.throw("name: options.minSamples, value: blue");
      });

      it("passes options along to bench-node", () => {
        benchmark.add("topLevel", () => {
        }, {minSamples: 17});

        expect(benchmark.suites).to.have.length(1);
      });
    });

    describe("suite()", () => {
      it("expects a name and function", () => {
        expect(benchmark.suite).to.throw();
      });

      it("expects a name and function", () => {
        benchmark.suite("name", (suite) => {
        });
      });

      it("can add nested tests", () => {
        benchmark.suite("name", (suite) => {
          suite.add("a test", () => {
          });
        });

        expect(benchmark.suites).to.have.length(1);
      });
    });

    describe("run()", () => {
      it("handles an empty set", async () => {
        await benchmark.run();
      });

      it("handles versions", async () => {
        benchmark = new Faceoff({
          "faceoff@latest": "faceoff@1.0.0"
        });

        await benchmark.run();
      });

      it("calls the tests", async (context) => {
        let fn = chai.spy(() => {})

        benchmark.add("toRun", fn);

        await benchmark.run();

        expect(fn).to.have.been.called();
      });

      it("calls the lifecycle setup function", async () => {
        let setup = chai.spy(() => {})

        benchmark.add("toRun", () => {}, { setup });

        await benchmark.run();

        expect(setup).to.have.been.called();
      });

      it("canonicalizes relative locations", async () => {
        beforeEach(() => {
          benchmark = new Faceoff({ currentVersion: { location: "." } });
        });

        let location;

        benchmark.add("toRun", () => {}, {
          setup: (module, val) => {
            location = val;
          }
        });

        await benchmark.run();

        expect(location).to.equal(process.cwd());
      });

      it("accepts absolute paths for locations", async () => {
        const absolutePath = process.cwd();

        benchmark = new Faceoff({ currentVersion: { location: absolutePath } } );

        let location;

        benchmark.add("toRun", () => {}, {
          setup: (module, val) => {
            location = val;
          }
        });

        await benchmark.run();

        expect(location).to.equal(process.cwd());
      });

      it("calls the lifecycle teardown function", async () => {
        let teardown = chai.spy(() => {})

        benchmark.add("toRun", () => {}, { teardown });

        await benchmark.run();

        expect(teardown).to.have.been.called();
      });

      it("calls the lifecycle teardown function even on errors", async () => {
        let teardown = chai.spy(() => {})

        benchmark.add("toRun",
          () => { throw new Error("Oops")},
          { teardown }
        );

        await expect(benchmark.run()).to.be.rejectedWith("Oops");

        expect(teardown).to.have.been.called();
      });

    });

    describe("outputResults()", () => {
      it("handles an empty set", async () => {
        await benchmark.run();

        const results = await benchmark.outputResults();

        expect(results).to.equal("{}");
      });

      it("handles no run() call", async () => {
        const results = await benchmark.outputResults();

        expect(results).to.equal("{}");
      });

      describe("with valid tests", () => {
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
});
