import Faceoff from "./index.js";

const benchmark = new Faceoff({ name: 'prom-client@latest', module: await import("prom-client") }, {
  "prom-client@trunk": await import("../prom-client/index.js"),
});

benchmark.add('new Registry()', ({ Registry }) => {
  new Registry();
});

let counter = 0;

benchmark.add('new Counter()', ({ Counter }, registry) => {
  return new Counter({
    name: `Counter_${counter++}`,
    help: 'Counter',
    labelNames: [],
    registers: [registry]
  });
}, {
  setup: ({ Registry }) => new Registry()
});

const results = await benchmark.run();
