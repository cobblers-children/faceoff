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

### Example Output

```
Installing [latest]: prom-client@latest
Installing [trunk]: git@github.com:siimon/prom-client
Installing [#perf/keys]: git@github.com:cobblers-children/prom-client.git#perf/keys

constructors ⇒ new Registry() ⇒ latest        x 15,627,856 ops/sec (11 runs sampled) min..max=(59.45ns...64.89ns)
constructors ⇒ new Registry() ⇒ trunk         x 13,090,493 ops/sec (12 runs sampled) min..max=(74.68ns...77.71ns)
constructors ⇒ new Registry() ⇒ #perf/keys    x 13,279,780 ops/sec (11 runs sampled) min..max=(74.36ns...76.19ns)

Summary (vs. baseline):
  constructors ⇒ new Registry() ⇒ latest      (baseline)
  constructors ⇒ new Registry() ⇒ trunk       (1.19x slower)
  constructors ⇒ new Registry() ⇒ #perf/keys  (1.18x slower)

T-Test Mode: Enabled (repeatSuite=30)

constructors ⇒ new Counter() ⇒ latest         x 1,166,642 ops/sec (120 runs sampled) min..max=(539.62ns...1.08us)
constructors ⇒ new Counter() ⇒ trunk          x 1,149,379 ops/sec (109 runs sampled) min..max=(312.50ns...1.46us)
constructors ⇒ new Counter() ⇒ #perf/keys     x 1,185,141 ops/sec (107 runs sampled) min..max=(291.50ns...1.54us)

Summary (vs. baseline):
  constructors ⇒ new Counter() ⇒ latest      (baseline)
  constructors ⇒ new Counter() ⇒ trunk       (1.02x slower)
  constructors ⇒ new Counter() ⇒ #perf/keys  (1.02x faster)

  Significance: * p<0.05, ** p<0.01, *** p<0.001

util ⇒ LabelMap.keyFrom() ⇒ trunk             x 7,332,146 ops/sec (11 runs sampled) min..max=(136.07ns...136.64ns)
util ⇒ LabelMap.keyFrom() ⇒ #perf/keys        x 7,345,240 ops/sec (11 runs sampled) min..max=(135.50ns...136.86ns)

Summary (vs. baseline):
  util ⇒ LabelMap.keyFrom() ⇒ trunk       (baseline)
  util ⇒ LabelMap.keyFrom() ⇒ #perf/keys  (1.00x faster)

Node.js version: v20.19.4
Platform: darwin arm64
CPU Cores: 12 vCPUs | 64.0GB Mem


constructors ⇒ new Registry()

Summary (vs. baseline):
 ⇒ latest                        ▏█████████████████████████▕ 15,627,856 ops/sec | 11 samples (baseline)
 ⇒ trunk                         ▏████████████████████▌────▕ 13,090,493 ops/sec | 12 samples (1.19x slower)
 ⇒ #perf/keys                    ▏█████████████████████────▕ 13,279,780 ops/sec | 11 samples (1.18x slower)

constructors ⇒ new Counter()

Summary (vs. baseline):
 ⇒ latest                        ▏████████████████████████▌▕ 1,166,642 ops/sec | 120 samples (baseline)
 ⇒ trunk                         ▏████████████████████████─▕ 1,149,379 ops/sec | 109 samples (1.02x slower)
 ⇒ #perf/keys                    ▏█████████████████████████▕ 1,185,141 ops/sec | 107 samples (1.02x faster)

util ⇒ LabelMap.keyFrom()

Summary (vs. baseline):
 ⇒ trunk                         ▏████████████████████████▌▕ 7,332,146 ops/sec | 11 samples (baseline)
 ⇒ #perf/keys                    ▏█████████████████████████▕ 7,345,240 ops/sec | 11 samples (1.00x faster)


Inconclusive Tests:
------------------------

constructors ⇒ new Counter()
 ⇒ latest                        ▏████████████████████████▌▕ 1,166,642 ops/sec | 120 samples (baseline)
 ⇒ trunk                         ▏████████████████████████─▕ 1,149,379 ops/sec | 109 samples (1.02x slower)
 ⇒ #perf/keys                    ▏█████████████████████████▕ 1,185,141 ops/sec | 107 samples (1.02x faster)


Performance Regressions:
------------------------

constructors ⇒ new Registry()
 ⇒ latest                        ▏█████████████████████████▕ 15,627,856 ops/sec | 11 samples (baseline)
 ⇒ trunk                         ▏████████████████████▌────▕ 13,090,493 ops/sec | 12 samples (1.19x slower)
 ⇒ #perf/keys                    ▏█████████████████████────▕ 13,279,780 ops/sec | 11 samples (1.18x slower)

```

### Usage

You can provide any number of versions of your code to compare against. For particular tests that are
for new functions, that may exist at HEAD and perhaps trunk, but not in the latest build, you can add a
skip attribute.

The convention used is that the first version provided is the baseline, and the last listed is the version
under test

```
import current from "..";

const benchmark = new Faceoff({
  "prom-client@latest": "prom-client@latest",
  "prom-client@trunk": "git@github.com:siimon/prom-client",
  "prom-client@current": { location: "." },
});

benchmark.suite('constructors', (suite) => {
  suite.add('new Registry()', ({ Registry }) => new Registry());
});

benchmark.suite('util', (suite) => {
  suite.add(
    'LabelMap.keyFrom()',
    (client, labelMap) => labelMap.keyFrom({ foo: 'longish', user_agent: 'Chrome', status_code: 503 }),
    {
      setup: (_, location) => {
        const require = createRequire(location);
        const { LabelMap } = require(Path.join(location, "lib/util.js"));
        return new LabelMap([ 'foo', 'user_agent' ]);
      },
      skip: ["prom-client@latest"],
    },
  );
});

```

### Notes

Faceoff does not and will not run post-install scripts for the modules under test.
