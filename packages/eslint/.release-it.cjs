const { monorepoIndependent } = require("@frsource/release-it-config");

module.exports = monorepoIndependent({
  name: "eslint-config",
  buildCmd: "", // no build needed
});
