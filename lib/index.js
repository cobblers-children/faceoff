import fs from "node:fs/promises";
import path from "path";
import { Suite } from "bench-node";
import Util from "./util.js";

/**
 * @typedef {Object} SuiteOptions
 * @property {String[]=} skip - list of versions to skip. Useful for benchmarking new features
 * @property {function=} setup - initialization function to run before suite
 * @property {function=} teardown - cleanup function to run after suite
 */

/**
 * @class Faceoff
 */
class Faceoff {
  #lastResults = undefined;

  /**
   * @param versions {object}
   */
  constructor(versions) {
    this.versions = versions;
    this.suites = [];
    this.names = [];
  }

  /**
   * Add a new test
   * @param name
   * @param fn
   * @param options
   * @returns {Faceoff}
   */
  add(name, fn, options = {}) {
    const {
      skip = [],
      setup,
      teardown,
      ...suiteOptions } = options;

    const versions = Object.keys(this.versions)
        .filter((version) => !skip.includes(version));

    const suite = new Suite({ name });

    for (let i = 0; i < versions.length; i++) {
      const version = versions[i];
      const moduleName = version;
      const suiteName = this.names.concat([name, version]).join(" ⇒ ");

      suite.add(suiteName,
        { suiteOptions, baseline: i === 0 },
        this.#wrapper(fn, moduleName, setup, teardown)
      );
    }

    this.suites.push(suite);
    return this;
  }

  suite(name, fn) {
    this.names.push(name);

    try {
      fn(this);
    } finally {
      this.names.pop();
    }
  }

  /**
   * Run the benchmarks.
   *
   * @returns {Promise<Faceoff>}
   */
  async run() {
    this.modules = await setup(this.versions);

    const results = [];
    for (const suite of this.suites) {
      console.log();
      results.push(await suite.run());
    }

    Util.chartResults(results);

    this.#lastResults = results;

    return this;
  }

  /**
   * output results to a file;
   * @param filenameb {-nldsc}
   * @returns {Promise<void>}
   */
  async outputResults(filename = "./output/benchmark-results/benchmark.json") {
    const json = Util.toJSON(this.#lastResults);

    const basename = path.dirname(filename);
    await fs.mkdir(basename, { recursive: true });
    await fs.writeFile(filename, json);
  }

  #wrapper(fn, moduleName, setup, teardown) {
    return async(timer) => {
      const { module, location } = this.modules[moduleName];
      const ctx = setup && await setup(module, location);

      let i = 0;
      try {
        timer.start();

        while (i < timer.count) {
          await fn(module, ctx)
          i++;
        }
      } finally {
        timer.end(i);
      }

      if (teardown) {
        await teardown(module, ctx);
      }
    }
  }
}

/**
 * Do setup work.
 *
 * At present, this is mostly loading of the modules under test.
 * @param versions {object}
 * @returns {Promise<void>}
 */
async function setup(versions) {
  const loaded = {};

  for (const [name, value] of Object.entries(versions)) {
    if (typeof value !== "object") {
      const moduleInfo = await Util.install(name, value);
      loaded[name] = moduleInfo;
    } else if (value.module !== undefined && value.location !== undefined) {
      loaded[name] = value;
    } else {
      loaded[name] = { module: value, location: process.cwd() };
    }
  }

  return loaded;
}


export default Faceoff;
