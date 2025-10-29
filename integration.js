import { createRequire } from 'node:module';
import Path from 'path';
import Faceoff from "./lib/index.js";

const benchmark = new Faceoff({
  "prom-client@latest": "prom-client@latest",
  "prom-client@trunk": "git@github.com:siimon/prom-client",
  "prom-client@keys": "git@github.com:cobblers-children/prom-client.git#perf/keys",
});

benchmark.suite('constructors', (suite) => {
  suite.add('new Registry()', ({ Registry }) => {
    new Registry();
  });

  let counter = 0;

  suite.add('new Counter()', ({ Counter }, registry) => {
    return new Counter({
      name: `Counter_${counter++}`,
      help: 'Counter',
      labelNames: [],
      registers: [registry]
    });
  }, {
    setup: ({ Registry }) => new Registry(),
    teardown: (mod, registry) => registry.clear(),
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
        const { LabelMap } = require(Path.join(location, "lib/util.js"));
        return new LabelMap([
          'foo',
          'user_agent',
          'gateway',
          'method',
          'status_code',
        ]);
      },
      skip: ["prom-client@latest"],
    },
  );
});

await (await benchmark.run()).outputResults();
