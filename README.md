# <img src="media/logo.svg" alt="faceoff" height="40px" valign="top" /> Faceoff

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
Installing [prom-client@latest]: prom-client prom-client@latest
Installing [prom-client@trunk]: prom-client git@github.com:siimon/prom-client
Installing [prom-client@keys]: prom-client git@github.com:cobblers-children/prom-client.git#perf/keys

constructors ⇒ new Registry() ⇒ prom-client@latest x 14,035,024 ops/sec (12 runs sampled) v8-never-optimize=true min..max=(69.91ns...72.61ns)
constructors ⇒ new Registry() ⇒ prom-client@trunk x 11,428,570 ops/sec (12 runs sampled) v8-never-optimize=true min..max=(65.12ns...114.78ns)
constructors ⇒ new Registry() ⇒ prom-client@keys x 13,316,166 ops/sec (12 runs sampled) v8-never-optimize=true min..max=(74.20ns...76.07ns)

Summary (vs. baseline):
  constructors ⇒ new Registry() ⇒ prom-client@latest  (baseline)
  constructors ⇒ new Registry() ⇒ prom-client@trunk   (1.23x slower)
  constructors ⇒ new Registry() ⇒ prom-client@keys    (1.05x slower)

constructors ⇒ new Counter() ⇒ prom-client@latest x 1,203,153 ops/sec (11 runs sampled) v8-never-optimize=true min..max=(740.62ns...970.70ns)
constructors ⇒ new Counter() ⇒ prom-client@trunk x 1,203,335 ops/sec (11 runs sampled) v8-never-optimize=true min..max=(713.51ns...958.12ns)
constructors ⇒ new Counter() ⇒ prom-client@keys x 1,190,763 ops/sec (13 runs sampled) v8-never-optimize=true min..max=(403.49ns...1.06us)

Summary (vs. baseline):
  constructors ⇒ new Counter() ⇒ prom-client@latest  (baseline)
  constructors ⇒ new Counter() ⇒ prom-client@keys    (1.01x slower)
  constructors ⇒ new Counter() ⇒ prom-client@trunk   (1.00x faster)

util ⇒ LabelMap.keyFrom() ⇒ prom-client@trunk x 5,486,892 ops/sec (10 runs sampled) v8-never-optimize=true min..max=(179.33ns...184.43ns)
util ⇒ LabelMap.keyFrom() ⇒ prom-client@keys  x 7,192,184 ops/sec (11 runs sampled) v8-never-optimize=true min..max=(135.62ns...142.50ns)

Summary (vs. baseline):
  util ⇒ LabelMap.keyFrom() ⇒ prom-client@trunk  (baseline)
  util ⇒ LabelMap.keyFrom() ⇒ prom-client@keys   (1.31x faster)

Node.js version: v22.18.0
Platform: darwin arm64
CPU Cores: 12 vCPUs | 64.0GB Mem


constructors ⇒ new Registry()

Summary (vs. baseline):
 ⇒ prom-client@latest            | █████████████████████████ | 14,035,024 ops/sec | 12 samples (baseline)
 ⇒ prom-client@trunk             | ████████████████████───── | 11,428,570 ops/sec | 12 samples (1.23x slower)
 ⇒ prom-client@keys              | ███████████████████████▌─ | 13,316,166 ops/sec | 12 samples (1.05x slower)

constructors ⇒ new Counter()

Summary (vs. baseline):
 ⇒ prom-client@latest            | ████████████████████████▌ | 1,203,153 ops/sec | 11 samples (baseline)
 ⇒ prom-client@trunk             | █████████████████████████ | 1,203,335 ops/sec | 11 samples (1.00x faster)
 ⇒ prom-client@keys              | ████████████████████████▌ | 1,190,763 ops/sec | 13 samples (1.01x slower)

util ⇒ LabelMap.keyFrom()

Summary (vs. baseline):
 ⇒ prom-client@trunk             | ███████████████████────── | 5,486,892 ops/sec | 10 samples (baseline)
 ⇒ prom-client@keys              | █████████████████████████ | 7,192,184 ops/sec | 11 samples (1.31x faster)


Performance Regressions:
------------------------

constructors ⇒ new Registry()
 ⇒ prom-client@latest            | █████████████████████████ | 15,173,658 ops/sec | 12 samples (baseline)
 ⇒ prom-client@trunk             | ███████████████████████── | 14,116,966 ops/sec | 10 samples (1.07x slower)
 ⇒ prom-client@keys              | ███████████████████████── | 14,081,520 ops/sec | 11 samples (1.08x slower)

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
  "prom-client@current": current,
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
