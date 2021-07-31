module.exports = function (api) {
  api.cache(true);

  const presets = [];
  const plugins = [
    ["babel-plugin-root-import", {
      "rootPathSuffix": "./src"
    }],
    "@babel/plugin-proposal-export-default-from"
  ];

  return {
    presets,
    plugins
  }
}
