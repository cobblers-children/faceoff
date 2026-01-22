import { beforeEach, afterEach, describe, it } from "node:test";
import chai from 'chai';
import spies from "chai-spies";
import chaiAsPromised from 'chai-as-promised';
import chaiString from 'chai-string';
import Faceoff from "../../lib/index.js";
import { Suite } from "bench-node";

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
        benchmark.add("naked1", () => {});
        benchmark.add("naked2", () => {});

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

      describe("defaults", () => {
        const sandbox = chai.spy.sandbox();

        beforeEach(() => {
          benchmark = new Faceoff({ currentVersion: { location: "." } }, { minSamples: 17 });
          sandbox.on(Suite.prototype, "add");
        });

        afterEach(() => {
          sandbox.restore();
        });

        it("are inherited", () => {
          benchmark.suite("name", (suite) => {
            suite.suite("nested", (suite) => {
              suite.add("a test", () => {});
            });
          });

          expect(Suite.prototype.add).to.have.been.called.with(
            "name ⇒ nested ⇒ a test ⇒ currentVersion",
            { minSamples: 17, baseline: true }
          );
        });

        it("can override the defaults", async () => {
          benchmark.suite("name", (suite) => {
            suite.suite("nested", (suite) => {
              suite.add("a test", () => {}, { minSamples: 33 });
            });
          });

          expect(Suite.prototype.add).to.have.been.called.with(
              "name ⇒ nested ⇒ a test ⇒ currentVersion",
              { minSamples: 33, baseline: true }
          );
        });
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
        let fn = chai.spy(() => {});

        benchmark.add("toRun", fn);

        await benchmark.run();

        expect(fn).to.have.been.called();
      });
    });

    describe("run lifecycle", () => {
      describe("setup()", () => {
        it("is invoked", async () => {
          let setup = chai.spy(() => {});

          benchmark.add("toRun", () => {
          }, { setup });

          await benchmark.run();

          expect(setup).to.have.been.called();
        });

        it("receives a canonical path for relative locations", async () => {
          beforeEach(() => {
            benchmark = new Faceoff({currentVersion: {location: "."}});
          });

          let location;

          benchmark.add("toRun", () => {
          }, {
            setup: (module, val) => {
              location = val;
            }
          });

          await benchmark.run();

          expect(location).to.equal(process.cwd());
        });

        it("receives a canonical path from an absolute location", async () => {
          const absolutePath = process.cwd();

          benchmark = new Faceoff({currentVersion: {location: absolutePath}});

          let location;

          benchmark.add("toRun", () => {
          }, {
            setup: (module, val) => {
              location = val;
            }
          });

          await benchmark.run();

          expect(location).to.equal(process.cwd());
        });
      });

      describe("teardown()", () => {
        it("is called", async () => {
          let teardown = chai.spy(() => {});

          benchmark.add("toRun", () => {}, { teardown });

          await benchmark.run();

          expect(teardown).to.have.been.called();
        });

        it("is called on errors", async () => {
          let teardown = chai.spy(() => {});

          benchmark.add("toRun",
              () => { throw new Error("Oops")},
              { teardown }
          );

          await expect(benchmark.run()).to.be.rejectedWith("Oops");

          expect(teardown).to.have.been.called();
        });
      });

      describe("nested suites", async () => {
        it("calls the tests", async () => {
          let test = chai.spy(() => {});

          benchmark.suite("name", (suite) => {
            suite.suite("nested", (suite) => {
              suite.add("a test", test);
            });
          });

          await benchmark.run();

          expect(test).to.have.been.called();
        });

        describe("defaults", async () => {
          it("uses the defaults", async () => {
            let setup = chai.spy(() => {});
            let teardown = chai.spy(() => {});

            benchmark.suite("name", (suite) => {
              suite.suite("nested", (suite) => {
                suite.add("a test", () => {});
              },
              { setup, teardown });
            });

            await benchmark.run();

            expect(setup).to.have.been.called();
            expect(teardown).to.have.been.called();
          });

          it("can override the defaults", async () => {
            let defaultSetup = chai.spy(() => {});
            let setup = chai.spy(() => {});
            let teardown = chai.spy(() => {});

            benchmark.suite("name", (suite) => {
              suite.suite("nested", (suite) => {
                suite.add("a test", () => {},
                  { setup, teardown });
                },
                { setup: defaultSetup },
              );
            });

            await benchmark.run();

            expect(setup).to.have.been.called();
            expect(defaultSetup).not.to.have.been.called();
            expect(teardown).to.have.been.called();
          });
        });
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
    });
  });
});
