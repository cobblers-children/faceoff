import Faceoff from "./lib/index.js";

const benchmark = await Faceoff.create({
  "prom-client@current": await import("../prom-client/index.js"),
  "prom-client@trunk": "git@github.com:siimon/prom-client",
  "prom-client@latest": "prom-client@latest",
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
})

const results = await benchmark.run();
