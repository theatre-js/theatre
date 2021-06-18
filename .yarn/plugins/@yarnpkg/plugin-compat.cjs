module.exports = {
  name: `@yarnpkg/plugin-compat`,
  factory: (require) => {
    // dummy implementation to override the built-in version of this plugin
    return {}
  },
}
