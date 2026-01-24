# <img src="media/logo.svg" alt="faceoff"/>

[![npm package](https://img.shields.io/npm/v/faceoff)](https://www.npmjs.com/package/faceoff)
[![Downloads](https://badgen.net/npm/dt/faceoff)](https://www.npmjs.com/package/faceoff)
[![Issues](https://img.shields.io/github/issues/cobblers-children/faceoff)](https://github.com/cobblers-children/faceoff/issues)

## Benchmarking Tool for Comparing Application Versions

This is a benchmarking tool meant for comparing different versions of the same
code against each other. It is aiming for feature parity with
[benchmark-regression](https://github.com/nowells/benchmark-regression)
but built on top of [bench-node](https://github.com/RafaelGSS/bench-node).

Features:

- supports comparing multiple versions of modules
- can install versions from git urls
- handles async tests
- can skip tests for version where functionality is missing
- formatted summary view
- exposes metadata for whitebox testing of module internals

### Performance is a Feature

Faceoff and `benchmark-regression` before it are focussed on preventing regressions in pull requests
by comparing the code in your branch to the same code in previous releases. Where Faceoff differs is
that it can also compare a feature branch to release branches, or your trunk build. This is
particularly handy on projects where releases collect a number of PRs into a single build instead of
practicing Continuous Integration.

But collecting this data also has value after the fact. How often have you been told that the
application got slower, "sometime in the last couple of weeks" and now you are tasked to figure out
which of the last 45 commits or 120 dependency upgrades may have introduced the regression. Being
able to look back through build history looking for evidence of the problem can take a half day
investigation down to minutes.

Faster feedback loops help teams and developers develop their skills in avoiding unintentional
slowdowns in the application code.

### Example Output

```
Installing [latest]: prom-client@latest
Installing [trunk]: git@github.com:siimon/prom-client
Installing [#perf/keys]: git@github.com:cobblers-children/prom-client.git#perf/keys

...

Node.js version: v22.18.0
Platform: darwin arm64
CPU Cores: 12 vCPUs | 64.0GB Mem


constructors ⇒ new Registry()

 ⇒ latest                  ▏████████████████████▕ 14,374,847 op/s | 39 samples | (baseline)
 ⇒ trunk                   ▏██████████████████──▕ 13,271,458 op/s | 40 samples | (0.92x slower)
 ⇒ #perf/keys              ▏██████████████████──▕ 13,239,009 op/s | 40 samples | (0.92x slower)

constructors ⇒ metrics ⇒ new Counter()

 ⇒ latest                  ▏█████████████████▌──▕ 1,023,814 op/s | 36 samples | (baseline)
 ⇒ trunk                   ▏████████████████████▕ 1,169,455 op/s | 36 samples | (1.14x faster)
 ⇒ #perf/keys              ▏█████████████████▌──▕ 1,028,717 op/s | 36 samples | (1.00x faster)

constructors ⇒ metrics ⇒ new Gauge()

 ⇒ latest                  ▏████████████████████▕ 1,154,011 op/s | 40 samples | (baseline)
 ⇒ trunk                   ▏███████████████████▌▕ 1,137,773 op/s | 41 samples | (0.99x slower)
 ⇒ #perf/keys              ▏███████████████████─▕ 1,097,195 op/s | 41 samples | (0.95x slower)

util ⇒ LabelMap.keyFrom()

 ⇒ trunk                   ▏████████████████████▕ 7,260,850 op/s | 40 samples | (baseline)
 ⇒ #perf/keys              ▏███████████████████▌▕ 7,209,349 op/s | 40 samples | (0.99x slower)


Inconclusive Tests:
------------------------

util ⇒ LabelMap.keyFrom()

 ⇒ trunk                   ▏████████████████████▕ 7,260,850 op/s | 40 samples | (baseline)
 ⇒ #perf/keys              ▏███████████████████▌▕ 7,209,349 op/s | 40 samples | (0.99x slower)

Performance Regressions:
------------------------

 ⇒ latest                  ▏████████████████████▕ 14,374,847 op/s | 39 samples | (baseline)
 ⇒ trunk                   ▏██████████████████──▕ 13,271,458 op/s | 40 samples | (0.92x slower)
 ⇒ #perf/keys              ▏██████████████████──▕ 13,239,009 op/s | 40 samples | (0.92x slower)

 ⇒ latest                  ▏█████████████████▌──▕ 1,023,814 op/s | 36 samples | (baseline)
 ⇒ trunk                   ▏████████████████████▕ 1,169,455 op/s | 36 samples | (1.14x faster)
 ⇒ #perf/keys              ▏█████████████████▌──▕ 1,028,717 op/s | 36 samples | (1.00x faster)

 ⇒ latest                  ▏████████████████████▕ 1,154,011 op/s | 40 samples | (baseline)
 ⇒ trunk                   ▏███████████████████▌▕ 1,137,773 op/s | 41 samples | (0.99x slower)
 ⇒ #perf/keys              ▏███████████████████─▕ 1,097,195 op/s | 41 samples | (0.95x slower)

```

### Usage

You can provide any number of versions of your code to compare against. For particular tests that
are for new functions, that may exist at HEAD and perhaps trunk, but not in the latest build, you can
add a skip attribute.

The convention used is that the first version provided is the baseline, and the last listed is the
version under test. Any entries between first and last are reference versions or branches to detect
if the code under test has undone any improvements added in recent PRs.

```
import { createRequire } from 'node:module';
import Path from 'path';

const benchmark = new Faceoff({
  "latest": "prom-client@latest",
  "trunk": "git@github.com:siimon/prom-client",
  "current": { location: "." },
}, { minSamples: 45 });

benchmark.suite('constructors', (suite) => {
  suite.add('new Registry()', ({ Registry }) => new Registry());
});

benchmark.suite('util',
  (suite) => {
    suite.add('LabelMap.validate()',
      (client, labelMap) => {
        labelMap.validate({
          foo: 'longish:tag:goes:here',
          user_agent: 'Chrome',
          status_code: 503,
        });
      }
    );
  
    suite.add('LabelMap.keyFrom()',
      (client, labelMap) => labelMap.keyFrom({ 
        foo: 'longish',
        user_agent: 'Chrome',
        status_code: 503
      }),
      { ttest: true },
    );
  }, {
    setup: (_, location) => {
      const require = createRequire(location);
      const { LabelMap } = require(Path.join(location, "lib/util.js"));
      return new LabelMap([ 'foo', 'user_agent' ]);
    },
    skip: ["prom-client@latest"],
  }
);

```

### benchmark.json file format

It is my intention that this format will be amended in the future but retain the following structure
until at least 2.0:

```json
{
  "constructors ⇒ new Registry()": [
    {
      "name": " ⇒ latest",
      "runsSampled": 13,
      "min": "56.12ns",
      "max": "72.86ns",
      "plugins": [],
      "opsSec": 14300744
    },
    {
      "name": " ⇒ trunk",
      "runsSampled": 11,
      "min": "76.08ns",
      "max": "79.24ns",
      "plugins": [],
      "opsSec": 12946295
    },
    {
      "name": " ⇒ #perf/keys",
      "runsSampled": 10,
      "min": "76.05ns",
      "max": "77.92ns",
      "plugins": [],
      "opsSec": 12965191
    }
  ],
  "constructors ⇒ new Counter()": [
    {
      "name": " ⇒ latest",
      "runsSampled": 119,
      "min": "556.55ns",
      "max": "1.08us",
      "plugins": [],
      "opsSec": 1137460
    },
    {
      "name": " ⇒ trunk",
      "runsSampled": 96,
      "min": "312.50ns",
      "max": "1.25us",
      "plugins": [],
      "opsSec": 1153108
    },
    {
      "name": " ⇒ #perf/keys",
      "runsSampled": 95,
      "min": "291.50ns",
      "max": "1.26us",
      "plugins": [],
      "opsSec": 1170779
    }
  ],
  "util ⇒ LabelMap.keyFrom()": [
    {
      "name": " ⇒ trunk",
      "runsSampled": 13,
      "min": "130.41ns",
      "max": "141.50ns",
      "plugins": [],
      "opsSec": 7195488
    },
    {
      "name": " ⇒ #perf/keys",
      "runsSampled": 11,
      "min": "136.96ns",
      "max": "140.96ns",
      "plugins": [],
      "opsSec": 7180307
    }
  ]
}
```

### Inconclusive Tests

Every test run has noise. When a test has a lot of jitter in it, the average time per run does not prove that one case is
consistently 10% faster than another. A Statistical Analysis called the t-test compares two sets of
samples against each other to determine if the spread of values indicated a pattern or just noise - 
Whether the results are significant or not.

The problem is that Faceoff presents an arbitrary number of versions and invites the user to 
compare them all against each other. As far as we are aware, the transitive property does not 
necessarily apply to significance tests. If two results are significant to a third, that does not mean they are significant in relationship to
each other.

We report a test as slow if the current (subject) version is slower than the fastest version by 5%,

#### Parsing advice

The most likely change in 2.0 would be to the 'name' fields to make it more amenable to
use as categories/tags in CI/CD telemetry collection. That is easily worked around here by splitting
the name on ` ⇒ ` and using the first index of the result. If `faceoff` ends up pruning this prefix,
then your `split()` will become a noop.

### Notes

Faceoff does not and will not run post-install scripts for the modules under test.
