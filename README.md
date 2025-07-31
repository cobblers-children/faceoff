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

constructors ⇒ new Registry() ⇒ prom-client@latest x 15,722,132 ops/sec (11 runs sampled) v8-never-optimize=true min..max=(62.48ns...65.36ns)
constructors ⇒ new Registry() ⇒ prom-client@trunk x 14,002,714 ops/sec (11 runs sampled) v8-never-optimize=true min..max=(70.76ns...72.81ns)
constructors ⇒ new Registry() ⇒ prom-client@current x 14,208,801 ops/sec (11 runs sampled) v8-never-optimize=true min..max=(69.80ns...71.12ns)

Summary (vs. baseline):
  constructors ⇒ new Registry() ⇒ prom-client@latest   (baseline)
  constructors ⇒ new Registry() ⇒ prom-client@trunk    (1.12x slower)
  constructors ⇒ new Registry() ⇒ prom-client@current  (1.11x slower)

constructors ⇒ new Counter() ⇒ prom-client@latest x 1,187,074 ops/sec (11 runs sampled) v8-never-optimize=true min..max=(621.03ns...907.70ns)
constructors ⇒ new Counter() ⇒ prom-client@trunk x 1,435,035 ops/sec (11 runs sampled) v8-never-optimize=true min..max=(567.68ns...838.65ns)
constructors ⇒ new Counter() ⇒ prom-client@current x 1,256,456 ops/sec (10 runs sampled) v8-never-optimize=true min..max=(700.25ns...933.49ns)

Summary (vs. baseline):
  constructors ⇒ new Counter() ⇒ prom-client@latest   (baseline)
  constructors ⇒ new Counter() ⇒ prom-client@current  (1.06x faster)
  constructors ⇒ new Counter() ⇒ prom-client@trunk    (1.21x faster)

Node.js version: v22.17.1
Platform: darwin arm64
CPU Cores: 12 vCPUs | 64.0GB Mem


constructors ⇒ new Registry()
Node.js version: v22.17.1
Platform: darwin arm64
CPU Cores: 12 vCPUs | 64.0GB Mem

 ⇒ prom-client@latest                         | █████████████████████████ | 15,722,132 ops/sec | 11 samples
 ⇒ prom-client@trunk                          | ██████████████████████─── | 14,002,714 ops/sec | 11 samples
 ⇒ prom-client@current                        | ██████████████████████▌── | 14,208,801 ops/sec | 11 samples

constructors ⇒ new Counter()
Node.js version: v22.17.1
Platform: darwin arm64
CPU Cores: 12 vCPUs | 64.0GB Mem

 ⇒ prom-client@latest                         | ████████████████████▌──── | 1,187,074 ops/sec | 11 samples
 ⇒ prom-client@trunk                          | █████████████████████████ | 1,435,035 ops/sec | 11 samples
 ⇒ prom-client@current                        | █████████████████████▌─── | 1,256,456 ops/sec | 10 samples

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
