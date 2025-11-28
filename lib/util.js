import Path from "path";
import { exec } from "child_process";
import { styleText } from "node:util";
import { createRequire } from 'node:module';
import { chartReport } from "bench-node";
import report from "bench-node/lib/report.js";

const DEFAULT_LABEL_WIDTH = 32;

/**
 * Pull a package name out of the packageString
 * @param packageString
 * @returns {*}
 */
function packageName(packageString) {
  const index = packageString.lastIndexOf("@");

  if (index < 1) {
    return packageString;
  }

  return packageString.slice(0, index);
}

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
  const tempDirName = (await asyncExec('mktemp -d')).trim();

  await asyncExec('mkdir -v node_modules', { cwd: tempDirName });

  const name = packageName(versionString);

  console.log(`Installing [${versionString}]: ${name} ${packageSemver}`);
  const result = await asyncExec(`npm install --ignore-scripts --omit dev ${packageSemver}`, { cwd: tempDirName });
  const require = createRequire(Path.join(tempDirName, "node_modules"));
  const module = await require(name);
  const location = Path.dirname(require.resolve(Path.join(name, "package.json")));

  return { module, location };
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

  const slow = findSlow(results);

  if (slow.length > 0) {
    console.log();
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
  packageName,
  headingName,
  asyncExec,
  install,
  findSlow,
  chartResults,
  toJSON,
};
