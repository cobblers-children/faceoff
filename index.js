import Path from "path";
import {exec} from "child_process";
import {chartReport, Suite} from "bench-node";
import { createRequire } from 'node:module';

class Faceoff {
  /**
   *
   * @param current {string: module}
   * @param versions {object}
   */
  constructor(versions) {
    this.versions = versions;
    this.suites = [];
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

      suite.add(`${name} ⇒ ${version}`,
        wrapper(fn, module, options.setup, options.teardown),
        options);
    }

    this.suites.push(suite);
    return this;
  }

  async run() {
    let modules = await setup(this.versions);

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
      const tempDirName = (await asyncExec('mktemp -d')).trim();

      await asyncExec('mkdir -v node_modules', { cwd: tempDirName });

      const packageSemver = value;
      const packageName = name.slice(0, name.lastIndexOf("@"));

      console.log(`Installing [${name}]: ${packageName} ${packageSemver}`);
      const result = await asyncExec(`npm install --ignore-scripts ${packageSemver}`, { cwd: tempDirName });
      const require = createRequire(Path.join(tempDirName, "node_modules"));
      const module = await require(packageName);

      loaded[name] = module;
    }
  }

  return loaded;
}

async function asyncExec(command, opts) {
  return new Promise((resolve, reject) => {
    exec(command, opts, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }

      resolve(stdout);
    });
  });
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
