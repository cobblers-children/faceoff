import fs from "node:fs/promises";
import path from "path";
import { Suite } from "bench-node";
import Util from "./util.js";

/**
 * @typedef {BenchmarkOptions} FaceoffOptions
 * @property {String[]=} skip - list of versions to skip. Useful for benchmarking new features
 * @property {function=} setup - initialization function to run before suite
 * @property {function=} teardown - cleanup function to run after suite
 */

/**
 * Callback function for adding benchmarks to a Faceoff suite
 *
 * @function SuiteCallback
 * @param {Faceoff} suite.
 */


/**
 * @class Faceoff
 */
class Faceoff {
  #lastResults = undefined;

  /**
   * @param {object} versions
   * @param {FaceoffOptions} [options]
   */
  constructor(versions, options = {}) {
    this.versions = versions ?? {};
    this.suites = [];

    //TODO: Rule of Three - if this gets any more complex it needs its own data type
    /** @type {string[]} */
    this.names = [];
    /* @type {FaceoffOptions[]} */
    this.defaults = [{ minSamples: 40, ...options }];
  }

  /**
   * Add a new test
   * @param name
   * @param fn
   * @param options {FaceoffOptions}
   * @returns {Faceoff}
   */
  add(name, fn, options = {}) {
    const defaultOptions = this.defaults.at(-1);
    const {
      skip = [],
      setup,
      teardown,
      ...remainingOptions } = { ...defaultOptions, ...options};

    /* @type {BenchmarkOptions} */
    const benchmarkOptions = remainingOptions ?? {};

    const versions = Object.keys(this.versions)
        .filter((version) => !skip.includes(version));

    const suite = new Suite({});

    for (let i = 0; i < versions.length; i++) {
      const version = versions[i];
      const moduleName = version;
      const benchmarkName = this.names.concat([name, version]).join(" ⇒ ");

      suite.add(benchmarkName,
        { ...benchmarkOptions, baseline: i === 0 },
        this.#wrapper(moduleName, fn, setup, teardown)
      );
    }

    this.suites.push(suite);
    return this;
  }

  /**
   * Create a nested suite
   * This creates a suite with a prefix of the parent suite. Useful for organizing
   * larger number of tests, such as for a utility file or a submodule.
   *
   * @param name {string}
   * @param fn {SuiteCallback}
   * @param defaultOptions {BenchmarkOptions} - Default options for any nested tests
   */
  suite(name, fn, defaultOptions = {}) {
    const parentDefaults = this.defaults.at(-1);

    this.names.push(name);
    this.defaults.push({...parentDefaults, ...defaultOptions});

    try {
      fn(this);
    } finally {
      this.names.pop();
      this.defaults.pop();
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

    this.#lastResults = Util.chartResults(results);

    return this;
  }

  /**
   * output a summary to console and to a file;
   * @param filename {string}
   * @returns {Promise<void>}
   */
  async outputResults(filename = "./output/benchmark-results/benchmark.json") {
    const json = JSON.stringify(this.#lastResults ?? {}, undefined, 2);
    const basename = path.dirname(filename);
    await fs.mkdir(basename, { recursive: true });
    await fs.writeFile(filename, json, { encoding: "utf8" });

    return json;
  }

  #wrapper(moduleName, fn, setup, teardown) {
    return async(timer) => {
      const { createRequire } = await import('node:module');
      const require = createRequire(process.cwd());
      const path = require("path");
      const { location } = this.modules[moduleName];
      const absolute = path.resolve(process.cwd(), location);
      const module = require(absolute);
      const ctx = setup && await setup(module, location);

      let i = 0;
      try {
        timer.start();

        while (i++ < timer.count) {
          await fn(module, ctx)
        }
      } finally {
        timer.end(i);

        if (teardown) {
          await teardown(module, ctx);
        }
      }
    };
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
    let version = undefined;
    let location = undefined;

    if (typeof value === "object") {
      version = value.version;
      location = path.resolve(process.cwd(), value.location);
    } else {
      version = value;
    }

    if (location === undefined) {
      let moduleInfo = await Util.install(name, version);
      location = moduleInfo.location;
    }

    loaded[name] = { location };
  }

  return loaded;
}


export default Faceoff;
