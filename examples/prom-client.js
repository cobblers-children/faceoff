import { createRequire } from 'node:module';
import Path from 'path';
import Faceoff from "../lib/index.js";

const benchmark = new Faceoff({
  "latest": "prom-client@latest",
  "trunk": "git@github.com:siimon/prom-client",
  "#perf/keys": "git@github.com:cobblers-children/prom-client.git#perf/keys",
});

benchmark.suite('constructors', (suite) => {
  suite.add('new Registry()', ({ Registry }) => {
    new Registry();
  });

  let counter = 0;

  suite.suite('metrics', (suite) => {
    suite.add('new Counter()', ({ Counter }, registry) => {
      return new Counter({
        name: `Counter_${counter++}`,
        help: 'Counter',
        labelNames: [],
        registers: [registry]
      });
    }, {
      maxTime: 0.1, // Unreasonably short to trigger inconclusive tests
      maxSamples: 6,
    });

    suite.add('new Gauge()', ({ Gauge }, registry) => {
      return new Gauge({
        name: `Gauge_${counter++}`,
        help: 'Gauge',
        labelNames: [],
        registers: [registry]
      });
    });
  }, {
    setup: ({Registry}) => new Registry(),
    teardown: (mod, registry) => registry.clear()
  });
});

benchmark.suite('util', (suite) => {
  suite.add(
    'LabelMap.keyFrom()',
    (client, labelMap) => {
      labelMap.keyFrom({
        foo: 'longish',
        user_agent: 'Chrome',
        status_code: 503,
      });
    },
    {
      setup: (_, location) => {
        const require = createRequire(location);
        const foo = require(Path.join(location, "lib/util.js"));
        const { LabelMap } = foo;

        return new LabelMap([
          'foo',
          'user_agent',
          'gateway',
          'method',
          'status_code',
        ]);
      },
      skip: ["latest"],
    },
  );
});

await (await benchmark.run()).outputResults();
