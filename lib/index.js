import { chartReport, Suite } from "bench-node";
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
   *
   * @param versions {object}
   * @returns {Promise<Faceoff>}
   */
  static async create(versions) {
    return new Faceoff(await setup(versions));
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

    for (const version of versions) {
      const module = this.versions[version];
      const suiteName = this.names.concat([name, version]).join(" ⇒ ");

      suite.add(suiteName,
        {
          minSamples: 50,
          minTime: 0.5,
          maxTime: 5,
          // repeatSuite: 2,
          ...options
        },
        wrapper(fn, module, options.setup, options.teardown),
          options);
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
    let modules = await setup(this.versions);

    const results = [];
    for (const suite of this.suites) {
      results.push(await suite.run());
    }

    console.log("");

    let first = true;
    for (const result of results) {
      console.log("");

      chartReport(result, { printHeader: first });
      first = false;
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

function wrapper(fn, module, setup, teardown) {
  return async(timer) => {
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

export default Faceoff;
