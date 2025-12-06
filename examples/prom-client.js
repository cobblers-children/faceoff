import { createRequire } from 'node:module';
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


  suite.suite('metrics', (suite) => {
    suite.add('new Counter()', ({ Counter }, ctx) => {
      return new Counter({
        name: `Counter_${ctx.counter++}`,
        help: 'Counter',
        labelNames: [],
        registers: [ctx.registry]
      });
    }, {
      maxTime: 0.1, // Unreasonably short to trigger inconclusive tests
      maxSamples: 6,
    });

    suite.add('new Gauge()', ({ Gauge }, ctx) => {
      return new Gauge({
        name: `Gauge_${ctx.counter++}`,
        help: 'Gauge',
        labelNames: [],
        registers: [ctx.registry]
      });
    });
  }, {
    setup: ({ Registry }) => {
      return {
        counter: 0,
        registry: new Registry()
      };
    },
    teardown: (mod, { registry }) => registry.clear()
  });
}, {
  useWorkers: true,
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
      setup: async (_, location) => {
        const { createRequire } = await import('node:module');
        const require = createRequire(location);
        const Path = require('path');
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
