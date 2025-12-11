import fs from "node:fs/promises";
import path from "path";
import { Suite } from "bench-node";
import Util from "./util.js";

/**
 * @typedef {Object} SuiteOptions
 * @property {String[]=} skip - list of versions to skip. Useful for benchmarking new features
 * @property {function=} setup - initialization function to run before suite
 * @property {function=} teardown - cleanup function to run after suite
 * @property {boolean=false} useWorkers - Use worker threads for isolation
 */

/**
 * @typedef {Object} VersionDescription
 * @property {String=} version - a version string that is used to `npm install` the target module
 * @property {String=} location - a path for require() for the version under test. Ex: ".."
 */

/**
 * @typedef {Object<String, VersionDescription | String>} ModuleVersions
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
    this.versions = versions ?? {};
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
      useWorkers = false,
      ...suiteOptions } = options;

    const versions = Object.keys(this.versions)
        .filter((version) => !skip.includes(version));

    const suite = new Suite({ useWorkers });

    for (let i = 0; i < versions.length; i++) {
      const version = versions[i];
      const moduleName = version;
      const suiteName = this.names.concat([name, version]).join(" ⇒ ");

      const wrappedFn = useWorkers ?
          this.#workerWrapper(moduleName, fn, setup, teardown) :
          this.#wrapper(moduleName, fn, setup, teardown) ;

      suite.add(suiteName,
        { ...suiteOptions, baseline: i === 0 },
        wrappedFn
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

    process.env.faceoff_modules = JSON.stringify(this.modules);

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
   * @param filename {string}
   * @returns {Promise<void>}
   */
  async outputResults(filename = "./output/benchmark-results/benchmark.json") {
    const json = Util.toJSON(this.#lastResults ?? []);

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

  #workerWrapper(moduleName, fn, setup, teardown) {
    const wrapped = this.#wrapper(moduleName, fn, setup, teardown);

    if (setup === undefined && teardown === undefined) {
      return wrapped;
    }

    const asString = `\
      const moduleName = "${moduleName}";\n\
      const fn = ${ fn.toString() };\n\
      const setup = ${setup && setup.toString()};\n\
      const teardown = ${teardown && teardown.toString()};\n\
      \n\        
      const unwrapped = ${wrapped.toString()};\n\
      \n\
      this.modules = JSON.parse(process.env.faceoff_modules);\n\
      \n\
      return unwrapped(timer);\n\
    `;

    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    return new AsyncFunction("timer", asString);
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
