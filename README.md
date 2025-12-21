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

constructors ⇒ new Registry() ⇒ latest        x 14,300,744 ops/sec (13 runs sampled) min..max=(56.12ns...72.86ns)
constructors ⇒ new Registry() ⇒ trunk         x 12,946,295 ops/sec (11 runs sampled) min..max=(76.08ns...79.24ns)
constructors ⇒ new Registry() ⇒ #perf/keys    x 12,965,191 ops/sec (10 runs sampled) min..max=(76.05ns...77.92ns)

Summary (vs. baseline):
  constructors ⇒ new Registry() ⇒ latest      (baseline)
  constructors ⇒ new Registry() ⇒ trunk       (1.10x slower)
  constructors ⇒ new Registry() ⇒ #perf/keys  (1.10x slower)

T-Test Mode: Enabled (repeatSuite=30)

constructors ⇒ new Counter() ⇒ latest         x 1,137,460 ops/sec (119 runs sampled) min..max=(556.55ns...1.08us)
constructors ⇒ new Counter() ⇒ trunk          x 1,153,108 ops/sec (96 runs sampled) min..max=(312.50ns...1.25us)
constructors ⇒ new Counter() ⇒ #perf/keys     x 1,170,779 ops/sec (95 runs sampled) min..max=(291.50ns...1.26us)

Summary (vs. baseline):
  constructors ⇒ new Counter() ⇒ latest      (baseline)
  constructors ⇒ new Counter() ⇒ trunk       (1.01x faster)
  constructors ⇒ new Counter() ⇒ #perf/keys  (1.03x faster)

  Significance: * p<0.05, ** p<0.01, *** p<0.001

util ⇒ LabelMap.keyFrom() ⇒ trunk             x 7,195,488 ops/sec (13 runs sampled) min..max=(130.41ns...141.50ns)
util ⇒ LabelMap.keyFrom() ⇒ #perf/keys        x 7,180,307 ops/sec (11 runs sampled) min..max=(136.96ns...140.96ns)

Summary (vs. baseline):
  util ⇒ LabelMap.keyFrom() ⇒ trunk       (baseline)
  util ⇒ LabelMap.keyFrom() ⇒ #perf/keys  (1.00x slower)

Node.js version: v20.19.4
Platform: darwin arm64
CPU Cores: 12 vCPUs | 64.0GB Mem


constructors ⇒ new Registry()

Summary (vs. baseline):
 ⇒ latest                    ▏█████████████████████████▕ 14,300,744 ops/sec | 13 samples (baseline)
 ⇒ trunk                     ▏██████████████████████▌──▕ 12,946,295 ops/sec | 11 samples (1.10x slower)
 ⇒ #perf/keys                ▏██████████████████████▌──▕ 12,965,191 ops/sec | 10 samples (1.10x slower)

constructors ⇒ new Counter()

Summary (vs. baseline):
 ⇒ latest                    ▏████████████████████████─▕ 1,137,460 ops/sec | 119 samples (baseline)
 ⇒ trunk                     ▏████████████████████████▌▕ 1,153,108 ops/sec | 96 samples (1.01x faster)
 ⇒ #perf/keys                ▏█████████████████████████▕ 1,170,779 ops/sec | 95 samples (1.03x faster)

util ⇒ LabelMap.keyFrom()

Summary (vs. baseline):
 ⇒ trunk                     ▏█████████████████████████▕ 7,195,488 ops/sec | 13 samples (baseline)
 ⇒ #perf/keys                ▏████████████████████████▌▕ 7,180,307 ops/sec | 11 samples (1.00x slower)


Inconclusive Tests:
------------------------

constructors ⇒ new Counter()
 ⇒ latest                    ▏████████████████████████─▕ 1,137,460 ops/sec | 119 samples (baseline)
 ⇒ trunk                     ▏████████████████████████▌▕ 1,153,108 ops/sec | 96 samples (1.01x faster)
 ⇒ #perf/keys                ▏█████████████████████████▕ 1,170,779 ops/sec | 95 samples (1.03x faster)


Performance Regressions:
------------------------

constructors ⇒ new Registry()
 ⇒ latest                    ▏█████████████████████████▕ 14,300,744 ops/sec | 13 samples (baseline)
 ⇒ trunk                     ▏██████████████████████▌──▕ 12,946,295 ops/sec | 11 samples (1.10x slower)
 ⇒ #perf/keys                ▏██████████████████████▌──▕ 12,965,191 ops/sec | 10 samples (1.10x slower)

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
