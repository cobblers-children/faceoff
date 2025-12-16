import Faceoff from "../lib/index.js";

const benchmark = new Faceoff({
  "6.2.0": "p-limit@6.2.0",
  "7.0": "p-limit@7.0",
  "latest": "p-limit@latest",
});

benchmark.suite('p-limit', (suite) => {
  suite.add('run sync',
    async (unused, limit) => {
      const promises = [];

      for (let i = 0; i < 1000; ++i) {
        promises.push(limit(() => 23 * 53));
      }

      await Promise.all(promises);
    }, {
      setup: (pLimit, location) => new pLimit.default(2)
    });
  });

await (await benchmark.run()).outputResults();
