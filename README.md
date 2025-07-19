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
Installing [prom-client@trunk]: prom-client git@github.com:siimon/prom-client
Installing [prom-client@latest]: prom-client prom-client@latest
constructors ⇒ new Registry() ⇒ prom-client@current x 13,904,688 ops/sec (9 runs sampled) v8-never-optimize=true min..max=(68.88ns...71.19ns)
constructors ⇒ new Registry() ⇒ prom-client@trunk x 14,292,052 ops/sec (11 runs sampled) v8-never-optimize=true min..max=(68.86ns...71.09ns)
constructors ⇒ new Registry() ⇒ prom-client@latest x 16,079,874 ops/sec (11 runs sampled) v8-never-optimize=true min..max=(61.55ns...63.07ns)
constructors ⇒ new Counter() ⇒ prom-client@current x 1,203,507 ops/sec (14 runs sampled) v8-never-optimize=true min..max=(388.00ns...984.24ns)
constructors ⇒ new Counter() ⇒ prom-client@trunk x 1,458,482 ops/sec (8 runs sampled) v8-never-optimize=true min..max=(627.55ns...709.43ns)
constructors ⇒ new Counter() ⇒ prom-client@latest x 1,195,390 ops/sec (12 runs sampled) v8-never-optimize=true min..max=(589.62ns...1.02us)

Node.js version: v22.17.0
Platform: darwin arm64
CPU Cores: 12 vCPUs | 64.0GB Mem


constructors ⇒ new Registry()
 ⇒ prom-client@current                        | ██████████████████████████---- | 13,904,688 ops/sec | 9 samples
 ⇒ prom-client@trunk                          | ███████████████████████████--- | 14,292,052 ops/sec | 11 samples
 ⇒ prom-client@latest                         | ██████████████████████████████ | 16,079,874 ops/sec | 11 samples

constructors ⇒ new Counter()
 ⇒ prom-client@current                        | █████████████████████████----- | 1,203,507 ops/sec | 14 samples
 ⇒ prom-client@trunk                          | ██████████████████████████████ | 1,458,482 ops/sec | 8 samples
 ⇒ prom-client@latest                         | █████████████████████████----- | 1,195,390 ops/sec | 12 samples

```

