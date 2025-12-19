import Path from "path";
import fs from "node:fs/promises";
import { tmpdir } from 'node:os';
import { exec } from "child_process";
import { styleText } from "node:util";
import { createRequire } from 'node:module';
import { chartReport } from "bench-node";
import report from "bench-node/lib/report.js";

const DEFAULT_LABEL_WIDTH = 32;

/**
 * Split suite name out of the test name
 * @param testName
 * @returns {*}
 */
function headingName(testName) {
    const pos = testName.lastIndexOf(' ⇒ ');

    return testName.slice(0, pos);
}

/**
 * Install the given module
 *
 * ```
 * Util.install("@babel/core@latest", "@babel/core")
 * ```
 *
 * @param versionString {string} logical name, starting with string suitable for 'import'
 * @param packageSemver {string|module} a string suitable for 'npm install', or the module
 * @returns {Promise<*>}
 */
async function install(versionString, packageSemver) {
  const installDir = await fs.mkdtemp(Path.join(tmpdir(), 'faceoff-'));

  await asyncExec('mkdir -v node_modules', { cwd: installDir });

  console.log(`Installing [${versionString}]: ${packageSemver}`);
  const result = await asyncExec(`npm install --ignore-scripts --omit dev ${packageSemver}`, { cwd: installDir });
  const path = Path.join(installDir, "node_modules");
  const require = createRequire(path);
  const pkg = JSON.parse(await fs.readFile(Path.join(installDir, "package.json"), 'utf8'));
  const moduleName = Object.keys(pkg.dependencies)[0];

  return {
    module: await require(moduleName),
    location: Path.join(path, moduleName)
  };
}

/**
 * Execute a command and await the results
 * @param command {string}
 * @param opts {object}
 * @returns {Promise<string>}
 */
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

/**
 * Filter for performance regressions.
 * @param results
 * @returns {*[]}
 */
function findSlow(results = []) {
  const slow = [];

  for (const result of results) {
    if (result.length < 2) {
      continue;
    }

    // This handles intermediate versions being faster than the baseline
    let subject = result.at(-1);

    if (subject.fastest !== true) {
      const fastest = result.find(entry => entry.fastest === true);
      const slower = fastest.opsSec / subject.opsSec;

      if (slower >= 1.05) {
        slow.push(result);
      }
    }
  }

  return slow;
}

function chartResults(results) {
  console.log("");

  chartReport([], { printHeader: true });

  for (const result of results) {
    const heading = headingName(result[0].name);

    console.log("");
    console.log(heading);

    let renamed = result.map((entry) => {
      return {
        ...entry,
        name: entry.name.slice(heading.length)
      }
    });

    chartReport(renamed, { labelWidth: DEFAULT_LABEL_WIDTH, printHeader: false });
  }

  console.log()
  console.log();

  const slow = findSlow(results);

  if (slow.length == 0) {
    console.log(styleText(["green", "bold"], "No significant regressions found."));
    console.log();
  } else {
    console.log(styleText(["red", "bold"], "Performance Regressions:"));
    console.log(styleText(["red", "bold"], "------------------------"));
    console.log();

    slow.forEach((result) => {
      let heading = headingName(result[0].name);
      let renamed = result.map((entry) => {
        return {
          ...entry,
          name: entry.name.slice(heading.length)
        }
      });

      let output = report.toChart(
          renamed,
          { labelWidth: DEFAULT_LABEL_WIDTH, printHeader: false }
      );

      console.log(styleText(["bold"], heading));
      let replaced = output.replace(/.*\n.*baseline\):\n/gm, "");
      console.log(replaced);
    });

    console.log();
  }
}

function toJSON(results) {
  const reply = {};

  // Workaround pending progress on
  for (let result of results) {
    const heading = headingName(result[0].name);

    const input = result.map((entry) => {
      return {
        ...entry,
        name: entry.name.slice(heading.length)
      }
    });

    const output = report.toJSON(input);

    reply[heading] = JSON.parse(output);
  }

  return JSON.stringify(reply, undefined, 2);
}

export default {
  headingName,
  asyncExec,
  install,
  findSlow,
  chartResults,
  toJSON,
};
