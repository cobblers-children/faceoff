import {chartReport, Suite} from "bench-node";

class Faceoff {
  /**
   *
   * @param current {string: module}
   * @param versions {object}
   */
  constructor(current, versions) {
    let name = current.name ?? "current";

    this.versions = {
      [name]: current.module ?? current,
      ...versions
    };

    this.suites = [];
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

      suite.add(`${name} ⇒ ${version}`,
        wrapper(fn, module, options.setup, options.teardown),
        options);
    }

    this.suites.push(suite);
    return this;
  }

  async run() {
    const results = [];
    for (const suite of this.suites) {
      results.push(await suite.run());
    }

    console.log("");
    console.log("Summary:");

    for (const result of results) {
      console.log("");

      chartReport(result);
    }
  }
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
      await teardown(module);
    }
  }
}

export default Faceoff;
