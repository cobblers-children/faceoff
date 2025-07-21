## Benchmarking Tool for Comparing Application Versions

This is a benchmarking tool meant for comparing different versions of the same
code against each other. It is aiming for feature parity with 
[benchmark-regression](https://github.com/nowells/benchmark-regression)
but built on top of [bench-node](https://github.com/RafaelGSS/bench-node).

Features:

- supports comparing multiple versions of modules, including git urls
- handles async tests
- can skip tests, such as for brand new functionality 
- formatted summary view to improve scanning

### Example Output

```
Installing [prom-client@latest]: prom-client prom-client@latest
Installing [prom-client@trunk]: prom-client git@github.com:siimon/prom-client

constructors ⇒ new Registry() ⇒ prom-client@latest x 16,110,108 ops/sec (11 runs sampled) v8-never-optimize=true min..max=(61.03ns...64.05ns)
constructors ⇒ new Registry() ⇒ prom-client@trunk x 14,511,233 ops/sec (11 runs sampled) v8-never-optimize=true min..max=(68.00ns...72.23ns)
constructors ⇒ new Registry() ⇒ prom-client@current x 14,676,220 ops/sec (11 runs sampled) v8-never-optimize=true min..max=(67.79ns...68.99ns)

Summary (vs. baseline):
  constructors ⇒ new Registry() ⇒ prom-client@latest   (baseline)
  constructors ⇒ new Registry() ⇒ prom-client@trunk    (1.11x slower)
  constructors ⇒ new Registry() ⇒ prom-client@current  (1.10x slower)

constructors ⇒ new Counter() ⇒ prom-client@latest x 1,413,512 ops/sec (13 runs sampled) v8-never-optimize=true min..max=(540.68ns...1.16us)
constructors ⇒ new Counter() ⇒ prom-client@trunk x 1,485,399 ops/sec (16 runs sampled) v8-never-optimize=true min..max=(324.51ns...827.06ns)
constructors ⇒ new Counter() ⇒ prom-client@current x 1,348,049 ops/sec (9 runs sampled) v8-never-optimize=true min..max=(534.20ns...785.37ns)

Summary (vs. baseline):
  constructors ⇒ new Counter() ⇒ prom-client@latest   (baseline)
  constructors ⇒ new Counter() ⇒ prom-client@current  (1.05x slower)
  constructors ⇒ new Counter() ⇒ prom-client@trunk    (1.05x faster)

Node.js version: v24.4.0
Platform: darwin arm64
CPU Cores: 12 vCPUs | 64.0GB Mem


constructors ⇒ new Registry()
 ⇒ prom-client@latest                         | █████████████████████████ | 16,110,108 ops/sec | 11 samples
 ⇒ prom-client@trunk                          | ██████████████████████▌── | 14,511,233 ops/sec | 11 samples
 ⇒ prom-client@current                        | ██████████████████████▌── | 14,676,220 ops/sec | 11 samples

constructors ⇒ new Counter()
 ⇒ prom-client@latest                         | ███████████████████████▌─ | 1,413,512 ops/sec | 13 samples
 ⇒ prom-client@trunk                          | █████████████████████████ | 1,485,399 ops/sec | 16 samples
 ⇒ prom-client@current                        | ██████████████████████▌── | 1,348,049 ops/sec | 9 samples

```

