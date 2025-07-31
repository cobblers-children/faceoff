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

constructors ⇒ new Registry() ⇒ prom-client@latest x 15,748,821 ops/sec (10 runs sampled) v8-never-optimize=true min..max=(61.87ns...65.77ns)
constructors ⇒ new Registry() ⇒ prom-client@trunk x 13,610,255 ops/sec (11 runs sampled) v8-never-optimize=true min..max=(71.01ns...75.31ns)
constructors ⇒ new Registry() ⇒ prom-client@keys x 12,995,102 ops/sec (11 runs sampled) v8-never-optimize=true min..max=(75.71ns...79.26ns)

Summary (vs. baseline):
  constructors ⇒ new Registry() ⇒ prom-client@latest  (baseline)
  constructors ⇒ new Registry() ⇒ prom-client@keys    (1.21x slower)
  constructors ⇒ new Registry() ⇒ prom-client@trunk   (1.16x slower)

constructors ⇒ new Counter() ⇒ prom-client@latest x 1,188,199 ops/sec (9 runs sampled) v8-never-optimize=true min..max=(749.28ns...812.53ns)
constructors ⇒ new Counter() ⇒ prom-client@trunk x 1,248,479 ops/sec (10 runs sampled) v8-never-optimize=true min..max=(685.09ns...928.96ns)
constructors ⇒ new Counter() ⇒ prom-client@keys x 1,244,583 ops/sec (10 runs sampled) v8-never-optimize=true min..max=(696.67ns...938.41ns)

Summary (vs. baseline):
  constructors ⇒ new Counter() ⇒ prom-client@latest  (baseline)
  constructors ⇒ new Counter() ⇒ prom-client@keys    (1.05x faster)
  constructors ⇒ new Counter() ⇒ prom-client@trunk   (1.05x faster)

util ⇒ LabelMap.keyFrom() ⇒ prom-client@trunk x 6,053,926 ops/sec (12 runs sampled) v8-never-optimize=true min..max=(163.30ns...167.29ns)
util ⇒ LabelMap.keyFrom() ⇒ prom-client@keys  x 7,637,732 ops/sec (11 runs sampled) v8-never-optimize=true min..max=(128.47ns...132.77ns)

Summary (vs. baseline):
  util ⇒ LabelMap.keyFrom() ⇒ prom-client@trunk  (baseline)
  util ⇒ LabelMap.keyFrom() ⇒ prom-client@keys   (1.26x faster)

Node.js version: v22.17.1
Platform: darwin arm64
CPU Cores: 12 vCPUs | 64.0GB Mem


constructors ⇒ new Registry()

Summary (vs. baseline):
 ⇒ prom-client@latest                         | █████████████████████████ | 15,748,821 ops/sec | 10 samples (baseline)
 ⇒ prom-client@trunk                          | █████████████████████▌─── | 13,610,255 ops/sec | 11 samples (1.16x slower)
 ⇒ prom-client@keys                           | ████████████████████▌──── | 12,995,102 ops/sec | 11 samples (1.21x slower)

constructors ⇒ new Counter()

Summary (vs. baseline):
 ⇒ prom-client@latest                         | ███████████████████████▌─ | 1,188,199 ops/sec |  9 samples (baseline)
 ⇒ prom-client@trunk                          | █████████████████████████ | 1,248,479 ops/sec | 10 samples (1.05x faster)
 ⇒ prom-client@keys                           | ████████████████████████▌ | 1,244,583 ops/sec | 10 samples (1.05x faster)

util ⇒ LabelMap.keyFrom()

Summary (vs. baseline):
 ⇒ prom-client@trunk                          | ███████████████████▌───── | 6,053,926 ops/sec | 12 samples (baseline)
 ⇒ prom-client@keys                           | █████████████████████████ | 7,637,732 ops/sec | 11 samples (1.26x faster)


Performance Regressions:
------------------------

Summary (vs. baseline):
 ⇒ prom-client@latest                         | █████████████████████████ | 15,748,821 ops/sec | 10 samples (baseline)
 ⇒ prom-client@trunk                          | █████████████████████▌─── | 13,610,255 ops/sec | 11 samples (1.16x slower)
 ⇒ prom-client@keys                           | ████████████████████▌──── | 12,995,102 ops/sec | 11 samples (1.21x slower)

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
