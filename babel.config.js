module.exports = function (api) {
  const env = api.env()

  const config = {
    presets: [['@babel/preset-react'], ['@babel/preset-typescript']],
    babelrcRoots: ['.', './packages/*', './theatre/*'],
  }
  if (env === 'test') {
    config.presets.unshift(['@babel/preset-env', {targets: {node: 'current'}}])
  } else {
    if (env === 'development' || env === 'production') {
      config.plugins.unshift(
        ['@babel/plugin-proposal-class-properties', {loose: true}],
        ['@babel/plugin-proposal-optional-chaining'],
        ['@babel/plugin-proposal-nullish-coalescing-operator'],
        ['@babel/plugin-proposal-logical-assignment-operators'],
      )
    } else {
      throw Error(`Babel env ` + env + ' is not yet configured.')
    }
  }

  return config
}
