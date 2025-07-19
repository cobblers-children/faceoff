import Path from "path";
import {exec} from "child_process";
import { createRequire } from 'node:module';
import {chartReport} from "bench-node";

function packageName(packageString) {
  const index = packageString.lastIndexOf("@");

  if (index < 1) {
    return packageString;
  }

  return packageString.slice(0, index);
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
  const result = await asyncExec(`npm install --ignore-scripts ${packageSemver}`, { cwd: tempDirName });
  const require = createRequire(Path.join(tempDirName, "node_modules"));
  const module = await require(name);

  return module;
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

function chartResults(results) {
  console.log("");

  chartReport([], { printHeader: true });

  for (const result of results) {
    const heading = result[0].name;
    const pos = heading.lastIndexOf(' ⇒ ');

    console.log("");
    console.log(heading.slice(0, pos));

    for (let entry of result) {
      entry.name = entry.name.slice(pos);
    }

    chartReport(result, { printHeader: false });
  }
}

export default {
  packageName,
  install,
  chartResults
};
