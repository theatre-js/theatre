const nodeRequrie = s => {
  const innerRequire = typeof window !== 'undefined' && eval('requrie')
}

const d =
  typeof window === 'undefined'
    ? nodeRequrie('./commitHash')
    : require('exec-loader!./commitHash')

const dotEnvFile = require('./dotEnvFile')

// Using `module.exports` instead of `export default` because that was easier to configure in
// webpack.ProvidePlugin
module.exports = {
  COMMIT_HASH: d.commitHash,
  ...dotEnvFile,
  PATH_TO_ROOT: d.pathToRoot,
}
