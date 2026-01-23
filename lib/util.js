import Path from "path";
import fs from "node:fs/promises";
import { tmpdir } from 'node:os';
import { exec } from "child_process";
import { styleText } from "node:util";
import { createRequire } from 'node:module';
import { compareBenchmarks } from "bench-node";
import { summarize } from "bench-node/lib/utils/analyze.js";
import report from "bench-node/lib/report.js";

const DEFAULT_LABEL_WIDTH = 25;
const BAR_WIDTH = 20;

const numberFormat = Intl.NumberFormat(undefined, {
  notation: "standard",
  maximumFractionDigits: 2,
});

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
 * @param summary
 * @returns {O ject}
 */
function findSlow(summary = {}) {
  const slow = {};

  for (const name of Object.keys(summary)) {
    let result = summary[name];
    let subject = result.at(-1);

    if ((result.length < 2) || subject.inconclusive) {
      continue;
    }

    // This handles intermediate versions being faster than the baseline
    if (subject.fastest !== true) {
      const fastest = result.find(entry => entry.fastest === true);
      const slower = fastest.opsSec / subject.opsSec;

      if (slower >= 1.05) {
        slow[name] = result;
      }
    }
  }

  return slow;
}

/**
 * Filter for performance results that are inconclusive
 * @param summary
 * @returns {Object}
 */

function findInconclusive(summary = {}) {
  const inconclusive = Object.entries(summary).filter(([_, result]) => {
    return result.length >= 2 && result.at(-1).inconclusive;
  });

  return Object.fromEntries(inconclusive);
}

/**
 * Chart the results and return the analysis
 * @param results
 * @returns {{}}
 */
function chartResults(results) {
  const summary = analyze(results);

  console.log(toString(summary));

  return summary;
}

function toString(summary) {
  let asString = "\n";

  asString += report.toChart([], { printHeader: true });

  for (const heading of Object.keys(summary)) {
    const result = summary[heading];

    asString += "\n";
    asString += heading;
    asString += "\n";
    asString += resultToString(result);
  }

  asString += "\n\n";

  const inconclusive = findInconclusive(summary);

  if (!isEmpty(inconclusive)) {
    asString += (styleText(["yellow", "bold"], "Inconclusive Tests:"));
    asString += "\n";
    asString += styleText(["yellow", "bold"], "------------------------");
    asString += "\n";

    Object.keys(inconclusive).forEach((heading) => {
      asString += "\n";
      asString += heading;
      asString += "\n";
      asString += resultToString(inconclusive[heading]);
    });

    asString += "\n";
  }

  const slow = findSlow(summary);

  if (isEmpty(slow)) {
    asString += styleText(["green", "bold"], "No significant regressions found.");
    console.log();
  } else {
    asString += styleText(["red", "bold"], "Performance Regressions:");
    asString += "\n";
    asString += styleText(["red", "bold"], "------------------------");
    asString += "\n";

    Object.values(slow).forEach((result) => {
      asString += resultToString(result);
    });
  }

  return asString;
}

function resultToString(result) {
  const maxValue = Math.max(...result.map((e) => e.opsSec));
  const maxNameLength = Math.max(...result.map((e) => e.name.length));
  const labelWidth = Math.max(maxNameLength, DEFAULT_LABEL_WIDTH);
  const baseline = result[0];

  let asString = "\n";

  for (let version of result) {
    let label = version.name.padEnd(labelWidth);
    let color;

    if (version.inconclusive) {
      color = "gray";
    } else if (version === baseline) {
      color = "black";
    } else if (version.opsSec > baseline.opsSec) {
      color = "green";
    } else {
      color = "red";
    }

    const bar = styleText(color, drawBar(version, maxValue));
    const opsSec= version.opsSec < 100 ?
        Number(version.opsSec.toFixed(2)) :
        Math.round(version.opsSec)
    const ops = styleText("yellow", numberFormat.format(opsSec)) + " op/s";
    const samples = styleText("yellow", `${version.runsSampled}`.padStart(2)) + " samples";

    let comment;

    if (version === baseline) {
      comment = styleText("magenta", "(baseline)");
    } else {
      let ratio = version.opsSec / baseline.opsSec;
      let ratioFixed = ratio.toFixed(2);
      if (ratio < 1.0) {
        comment = styleText(color, `(${ratioFixed}x slower)`);
      } else {
        comment = styleText(color, `(${ratioFixed}x faster)`);
      }
    }

    asString += `${label} ${bar}${ops} | ${samples} | ${comment}\n`
  }

  return asString;
}

/**
 * Draw a percentage bar using ANSI block characters.
 *
 * @param entry
 * @param max
 * @returns {string}
 */
function drawBar(entry, max) {
  const percent = entry.opsSec / max;
  const ticks = BAR_WIDTH * percent;
  const blockCount = Math.floor(ticks);
  const halfBlock = ticks % 1 >= 0.5;
  const solid = "█".repeat(blockCount) + (halfBlock ? "▌" : "");
  const remainder = BAR_WIDTH - solid.length;

  return ` ▏${solid}${"─".repeat(remainder)}▕ `;
}

/**
 * Clean up data and run significance tests on entries.
 *
 * @param result
 * @returns {*}
 */
function analyzeOne(result) {
  const baseline = result[0];
  const summary = summarize(result);

  let count = 0;

  let analysis = summary.map((data, i) => {
    const entry = result[i];
    const fastest = entry.fastest;
    const slowest = entry.slowest;

    if (entry === baseline) {
      return {
        ...data,
        ...(fastest && { fastest }),
        ...(slowest && { slowest }),
      };
    }

    const baseData = baseline.histogram.sampleData;
    const entryData = entry.histogram.sampleData;

    let significant = false;
    let pValue;

    if (baseData.length >= 30 && entryData.length >= 30) {
      const stats = compareBenchmarks(baseline.histogram.sampleData, entry.histogram.sampleData);
      significant = stats.significant;
      pValue = stats.pValue;

      if (significant) {
        count++;
      }
    };

    return {
      ...data,
      ...(fastest && { fastest }),
      ...(slowest && { slowest }),
      inconclusive: !significant,
      ...((pValue !== undefined) && { pValue }),
    };
  });

  // If all results were inconclusive, then the baseline is suspect
  analysis[0].inconclusive = (count === 0);

  return analysis;
}

function analyze(results) {
  const reply = {};

  for (let result of results) {
    const baseline = result[0];
    const heading = headingName(baseline.name);
    const summary = analyzeOne(result);

    reply[heading] = summary.map((entry) => {
      // Shorten names for tree view
      return {
        ...entry,
        name: entry.name.slice(heading.length)
      };
    });
  }

  return reply;
}

function isEmpty(obj) {
  for (let _ in obj) {
    return false;
  }

  return true;
}

export default {
  headingName,
  asyncExec,
  install,
  findSlow,
  findInconclusive,
  chartResults,
  toString,
  analyze,
};
