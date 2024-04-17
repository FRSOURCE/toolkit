const { monorepoIndependent } = require("./index.cjs");

module.exports = monorepoIndependent({
  name: "release-it",
  buildCmd: "", // no build needed
});
