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

constructors ⇒ new Registry() ⇒ latest        x 15,421,923 ops/sec (11 runs sampled) min..max=(60.03ns...70.78ns)
constructors ⇒ new Registry() ⇒ trunk         x 13,928,853 ops/sec (10 runs sampled) min..max=(69.93ns...72.07ns)
constructors ⇒ new Registry() ⇒ #perf/keys    x 14,117,921 ops/sec (11 runs sampled) min..max=(69.80ns...72.05ns)

Summary (vs. baseline):
  constructors ⇒ new Registry() ⇒ latest      (baseline)
  constructors ⇒ new Registry() ⇒ trunk       (1.11x slower)
  constructors ⇒ new Registry() ⇒ #perf/keys  (1.09x slower)

T-Test Mode: Enabled (repeatSuite=30)

constructors ⇒ metrics ⇒ new Counter() ⇒ latest x 1,165,364 ops/sec (114 runs sampled) min..max=(524.08ns...1.08us)
constructors ⇒ metrics ⇒ new Counter() ⇒ trunk x 1,240,467 ops/sec (91 runs sampled) min..max=(464.48ns...1.05us)
constructors ⇒ metrics ⇒ new Counter() ⇒ #perf/keys x 1,234,452 ops/sec (94 runs sampled) min..max=(312.50ns...1.25us)

Summary (vs. baseline):
  constructors ⇒ metrics ⇒ new Counter() ⇒ latest      (baseline)
  constructors ⇒ metrics ⇒ new Counter() ⇒ #perf/keys  (1.06x faster) **
  constructors ⇒ metrics ⇒ new Counter() ⇒ trunk       (1.06x faster) **

  Significance: * p<0.05, ** p<0.01, *** p<0.001

T-Test Mode: Enabled (repeatSuite=30)

constructors ⇒ metrics ⇒ new Gauge() ⇒ latest x 1,263,116 ops/sec (154 runs sampled) min..max=(546.66ns...1.11us)
constructors ⇒ metrics ⇒ new Gauge() ⇒ trunk  x 1,325,398 ops/sec (117 runs sampled) min..max=(333.50ns...1.03us)
constructors ⇒ metrics ⇒ new Gauge() ⇒ #perf/keys x 1,299,054 ops/sec (67 runs sampled) min..max=(640.38ns...948.08ns)

Summary (vs. baseline):
  constructors ⇒ metrics ⇒ new Gauge() ⇒ latest      (baseline)
  constructors ⇒ metrics ⇒ new Gauge() ⇒ #perf/keys  (1.03x faster)
  constructors ⇒ metrics ⇒ new Gauge() ⇒ trunk       (1.05x faster) ***

  Significance: * p<0.05, ** p<0.01, *** p<0.001

util ⇒ LabelMap.keyFrom() ⇒ trunk             x 7,661,811 ops/sec (12 runs sampled) min..max=(125.51ns...133.63ns)
util ⇒ LabelMap.keyFrom() ⇒ #perf/keys        x 7,507,553 ops/sec (12 runs sampled) min..max=(130.53ns...134.71ns)

Summary (vs. baseline):
  util ⇒ LabelMap.keyFrom() ⇒ trunk       (baseline)
  util ⇒ LabelMap.keyFrom() ⇒ #perf/keys  (1.02x slower)

Node.js version: v22.18.0
Platform: darwin arm64
CPU Cores: 12 vCPUs | 64.0GB Mem


constructors ⇒ new Registry()

Summary (vs. baseline):
 ⇒ latest                    ▏█████████████████████████▕ 15,421,923 ops/sec | 11 samples (baseline)
 ⇒ trunk                     ▏██████████████████████▌──▕ 13,928,853 ops/sec | 10 samples (1.11x slower)
 ⇒ #perf/keys                ▏██████████████████████▌──▕ 14,117,921 ops/sec | 11 samples (1.09x slower)

constructors ⇒ metrics ⇒ new Counter()

Summary (vs. baseline):
 ⇒ latest                    ▏███████████████████████──▕ 1,165,364 ops/sec | 114 samples (baseline)
 ⇒ trunk                     ▏█████████████████████████▕ 1,240,467 ops/sec | 91 samples (1.06x faster)
 ⇒ #perf/keys                ▏████████████████████████▌▕ 1,234,452 ops/sec | 94 samples (1.06x faster)

constructors ⇒ metrics ⇒ new Gauge()

Summary (vs. baseline):
 ⇒ latest                    ▏███████████████████████▌─▕ 1,263,116 ops/sec | 154 samples (baseline)
 ⇒ trunk                     ▏█████████████████████████▕ 1,325,398 ops/sec | 117 samples (1.05x faster)
 ⇒ #perf/keys                ▏████████████████████████▌▕ 1,299,054 ops/sec | 67 samples (1.03x faster)

util ⇒ LabelMap.keyFrom()

Summary (vs. baseline):
 ⇒ trunk                     ▏█████████████████████████▕ 7,661,811 ops/sec | 12 samples (baseline)
 ⇒ #perf/keys                ▏████████████████████████─▕ 7,507,553 ops/sec | 12 samples (1.02x slower)


Inconclusive Tests:
------------------------

constructors ⇒ metrics ⇒ new Gauge()
 ⇒ latest                    ▏███████████████████████▌─▕ 1,263,116 ops/sec | 154 samples (baseline)
 ⇒ trunk                     ▏█████████████████████████▕ 1,325,398 ops/sec | 117 samples (1.05x faster)
 ⇒ #perf/keys                ▏████████████████████████▌▕ 1,299,054 ops/sec | 67 samples (1.03x faster)


Performance Regressions:
------------------------

constructors ⇒ new Registry()
 ⇒ latest                    ▏█████████████████████████▕ 15,421,923 ops/sec | 11 samples (baseline)
 ⇒ trunk                     ▏██████████████████████▌──▕ 13,928,853 ops/sec | 10 samples (1.11x slower)
 ⇒ #perf/keys                ▏██████████████████████▌──▕ 14,117,921 ops/sec | 11 samples (1.09x slower)

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

#### Parsing advice

The most likely change in 2.0 would be to the 'name' fields to make it more amenable to
use as categories/tags in CI/CD telemetry collection. That is easily worked around here by splitting
the name on ` ⇒ ` and using the first index of the result. If `faceoff` ends up pruning this prefix,
then your `split()` will become a noop.

### Notes

Faceoff does not and will not run post-install scripts for the modules under test.
