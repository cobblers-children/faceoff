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
Node.js version: v22.17.0
Platform: darwin arm64
CPU Cores: 12 vCPUs | 64.0GB Mem


histogram ⇒ startTimer#6 with 2
 ⇒ prom-client@current                        | ██████████████████████████████ | 27,869 ops/sec | 10 samples
 ⇒ prom-client@trunk                          | ███████████████████████------- | 21,328 ops/sec | 9 samples
 ⇒ prom-client@latest                         | █████████████████████████----- | 23,495 ops/sec | 9 samples

util ⇒ hashObject
 ⇒ prom-client@current                        | ██████████████████████████████ | 4,964,671 ops/sec | 10 samples

util ⇒ LabelMap.validate()
 ⇒ prom-client@current                        | ██████████████████████████████ | 18,556,221 ops/sec | 11 samples

util ⇒ LabelMap.keyFrom()
 ⇒ prom-client@current                        | ██████████████████████████████ | 7,806,333 ops/sec | 11 samples

summary ⇒ observe#1 with 64
 ⇒ prom-client@current                        | ██████████████████████████████ | 114,738 ops/sec | 10 samples
 ⇒ prom-client@trunk                          | █████████████████████████████- | 109,239 ops/sec | 11 samples
 ⇒ prom-client@latest                         | ██████████████████████████---- | 98,438 ops/sec | 9 samples

summary ⇒ observe#2 with 8
 ⇒ prom-client@current                        | ██████████████████████████████ | 90,330 ops/sec | 9 samples
 ⇒ prom-client@trunk                          | █████████████████████--------- | 62,740 ops/sec | 9 samples
 ⇒ prom-client@latest                         | ███████████████████████------- | 69,596 ops/sec | 11 samples

summary ⇒ observe#2 with 4 and 2 with 2
 ⇒ prom-client@current                        | ██████████████████████████████ | 49,774 ops/sec | 11 samples
 ⇒ prom-client@trunk                          | ███████████████████████------- | 38,053 ops/sec | 10 samples
 ⇒ prom-client@latest                         | ██████████████████████████---- | 43,256 ops/sec | 9 samples

```

