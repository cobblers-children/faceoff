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

constructors ⇒ new Registry() ⇒ prom-client@latest x 16,060,325 ops/sec (11 runs sampled) v8-never-optimize=true min..max=(61.24ns...63.25ns)
constructors ⇒ new Registry() ⇒ prom-client@trunk x 13,952,339 ops/sec (13 runs sampled) v8-never-optimize=true min..max=(70.31ns...74.01ns)
constructors ⇒ new Registry() ⇒ prom-client@keys x 13,936,291 ops/sec (11 runs sampled) v8-never-optimize=true min..max=(69.89ns...75.70ns)

Summary (vs. baseline):
  constructors ⇒ new Registry() ⇒ prom-client@latest  (baseline)
  constructors ⇒ new Registry() ⇒ prom-client@keys    (1.15x slower)
  constructors ⇒ new Registry() ⇒ prom-client@trunk   (1.15x slower)

constructors ⇒ new Counter() ⇒ prom-client@latest x 1,246,515 ops/sec (13 runs sampled) v8-never-optimize=true min..max=(610.32ns...856.02ns)
constructors ⇒ new Counter() ⇒ prom-client@trunk x 1,226,537 ops/sec (11 runs sampled) v8-never-optimize=true min..max=(694.25ns...1.15us)
constructors ⇒ new Counter() ⇒ prom-client@keys x 1,232,537 ops/sec (10 runs sampled) v8-never-optimize=true min..max=(682.58ns...927.80ns)

Summary (vs. baseline):
  constructors ⇒ new Counter() ⇒ prom-client@latest  (baseline)
  constructors ⇒ new Counter() ⇒ prom-client@trunk   (1.02x slower)
  constructors ⇒ new Counter() ⇒ prom-client@keys    (1.01x slower)

util ⇒ LabelMap.keyFrom() ⇒ prom-client@trunk x 6,005,092 ops/sec (11 runs sampled) v8-never-optimize=true min..max=(164.42ns...168.72ns)
util ⇒ LabelMap.keyFrom() ⇒ prom-client@keys  x 7,607,503 ops/sec (11 runs sampled) v8-never-optimize=true min..max=(129.02ns...132.49ns)

Summary (vs. baseline):
  util ⇒ LabelMap.keyFrom() ⇒ prom-client@trunk  (baseline)
  util ⇒ LabelMap.keyFrom() ⇒ prom-client@keys   (1.27x faster)

Node.js version: v22.17.1
Platform: darwin arm64
CPU Cores: 12 vCPUs | 64.0GB Mem


constructors ⇒ new Registry()
 ⇒ prom-client@latest                         | ██████████████████████████████ | 16,060,325 ops/sec | 11 samples
 ⇒ prom-client@trunk                          | ██████████████████████████---- | 13,952,339 ops/sec | 13 samples
 ⇒ prom-client@keys                           | ██████████████████████████---- | 13,936,291 ops/sec | 11 samples

constructors ⇒ new Counter()
 ⇒ prom-client@latest                         | ██████████████████████████████ | 1,246,515 ops/sec | 13 samples
 ⇒ prom-client@trunk                          | ██████████████████████████████ | 1,226,537 ops/sec | 11 samples
 ⇒ prom-client@keys                           | ██████████████████████████████ | 1,232,537 ops/sec | 10 samples

util ⇒ LabelMap.keyFrom()
 ⇒ prom-client@trunk                          | ████████████████████████------ | 6,005,092 ops/sec | 11 samples
 ⇒ prom-client@keys                           | ██████████████████████████████ | 7,607,503 ops/sec | 11 samples


Performance Regressions:
------------------------
 ⇒ prom-client@latest                         | ██████████████████████████████ | 16,060,325 ops/sec | 11 samples
 ⇒ prom-client@trunk                          | ██████████████████████████---- | 13,952,339 ops/sec | 13 samples
 ⇒ prom-client@keys                           | ██████████████████████████---- | 13,936,291 ops/sec | 11 samples
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
