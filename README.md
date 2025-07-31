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
> node --allow-natives-syntax integration.js

Installing [prom-client@latest]: prom-client prom-client@latest
Installing [prom-client@trunk]: prom-client git@github.com:siimon/prom-client
Installing [prom-client@keys]: prom-client git@github.com:cobblers-children/prom-client.git#perf/keys

constructors ⇒ new Registry() ⇒ prom-client@latest x 16,511,017 ops/sec (9 runs sampled) v8-never-optimize=true min..max=(60.03ns...60.70ns)
constructors ⇒ new Registry() ⇒ prom-client@trunk x 14,081,691 ops/sec (11 runs sampled) v8-never-optimize=true min..max=(70.44ns...71.45ns)
constructors ⇒ new Registry() ⇒ prom-client@keys x 14,057,381 ops/sec (9 runs sampled) v8-never-optimize=true min..max=(70.24ns...71.05ns)

Summary (vs. baseline):
  constructors ⇒ new Registry() ⇒ prom-client@latest  (baseline)
  constructors ⇒ new Registry() ⇒ prom-client@keys    (1.17x slower)
  constructors ⇒ new Registry() ⇒ prom-client@trunk   (1.17x slower)

constructors ⇒ new Counter() ⇒ prom-client@latest x 1,230,247 ops/sec (10 runs sampled) v8-never-optimize=true min..max=(707.65ns...1.02us)
constructors ⇒ new Counter() ⇒ prom-client@trunk x 1,265,271 ops/sec (10 runs sampled) v8-never-optimize=true min..max=(706.92ns...897.45ns)
constructors ⇒ new Counter() ⇒ prom-client@keys x 1,217,013 ops/sec (8 runs sampled) v8-never-optimize=true min..max=(767.20ns...815.87ns)

Summary (vs. baseline):
  constructors ⇒ new Counter() ⇒ prom-client@latest  (baseline)
  constructors ⇒ new Counter() ⇒ prom-client@keys    (1.01x slower)
  constructors ⇒ new Counter() ⇒ prom-client@trunk   (1.03x faster)

util ⇒ LabelMap.keyFrom() ⇒ prom-client@trunk x 6,074,173 ops/sec (12 runs sampled) v8-never-optimize=true min..max=(163.55ns...165.70ns)
util ⇒ LabelMap.keyFrom() ⇒ prom-client@keys  x 7,491,786 ops/sec (10 runs sampled) v8-never-optimize=true min..max=(132.76ns...135.35ns)

Summary (vs. baseline):
  util ⇒ LabelMap.keyFrom() ⇒ prom-client@trunk  (baseline)
  util ⇒ LabelMap.keyFrom() ⇒ prom-client@keys   (1.23x faster)

Node.js version: v22.17.1
Platform: darwin arm64
CPU Cores: 12 vCPUs | 64.0GB Mem


constructors ⇒ new Registry()

Summary (vs. baseline):
 ⇒ prom-client@latest                         | █████████████████████████ | 16,511,017 ops/sec |  9 samples (baseline)
 ⇒ prom-client@trunk                          | █████████████████████──── | 14,081,691 ops/sec | 11 samples (1.17x slower)
 ⇒ prom-client@keys                           | █████████████████████──── | 14,057,381 ops/sec |  9 samples (1.17x slower)

constructors ⇒ new Counter()

Summary (vs. baseline):
 ⇒ prom-client@latest                         | ████████████████████████─ | 1,230,247 ops/sec | 10 samples (baseline)
 ⇒ prom-client@trunk                          | █████████████████████████ | 1,265,271 ops/sec | 10 samples (1.03x faster)
 ⇒ prom-client@keys                           | ████████████████████████─ | 1,217,013 ops/sec |  8 samples (1.01x slower)

util ⇒ LabelMap.keyFrom()

Summary (vs. baseline):
 ⇒ prom-client@trunk                          | ████████████████████───── | 6,074,173 ops/sec | 12 samples (baseline)
 ⇒ prom-client@keys                           | █████████████████████████ | 7,491,786 ops/sec | 10 samples (1.23x faster)


Performance Regressions:
------------------------

Summary (vs. baseline):
 ⇒ prom-client@latest                         | █████████████████████████ | 16,511,017 ops/sec |  9 samples (baseline)
 ⇒ prom-client@trunk                          | █████████████████████──── | 14,081,691 ops/sec | 11 samples (1.17x slower)
 ⇒ prom-client@keys                           | █████████████████████──── | 14,057,381 ops/sec |  9 samples (1.17x slower)

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
