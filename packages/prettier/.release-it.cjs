const { monorepoIndependent } = require("@frsource/release-it-config");

module.exports = monorepoIndependent({
  name: "prettier-config",
  buildCmd: "", // no build needed
});
