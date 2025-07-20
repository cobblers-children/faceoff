import { Suite } from "bench-node";
import Util from "./util.js";

class Faceoff {
  /**
   *
   * @param current {string: module}
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
    const skip = options?.skip ?? [];
    const versions = Object.keys(this.versions)
        .filter((version) => !skip.includes(version));

    const suite = new Suite({ name });

    let first = true;

    for (const version of versions) {
      const moduleName = version;
      const suiteName = this.names.concat([name, version]).join(" ⇒ ");

      suite.add(suiteName,
        { ...options, baseline: first },
        this.#wrapper(fn, moduleName, options.setup, options.teardown),
          options);

      first = false;
    }

    this.suites.push(suite);
    return this;
  }

  suite(name, fn, options = {}) {
    this.names.push(name);

    try {
      fn(this);
    } finally {
      this.names.pop();
    }
  }

  async run() {
    this.modules = await setup(this.versions);

    const results = [];
    for (const suite of this.suites) {
      results.push(await suite.run());
    }

    Util.chartResults(results);
  }

  #wrapper(fn, moduleName, setup, teardown) {
    return async(timer) => {
      const module = this.modules[moduleName];
      const ctx = setup && await setup(module);

      let i = 0;
      try {
        timer.start();

        while (i < timer.count) {
          await fn(module, ctx)
          i++;
        }
      } finally {
        timer.end(timer.count);
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
    if (typeof value === "object") {
      loaded[name] = value;
    } else {
      const module = await Util.install(name, value);
      loaded[name] = module;
    }
  }

  return loaded;
}


export default Faceoff;
