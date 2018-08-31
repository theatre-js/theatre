// this is the same as ./index.js, but doesn't need to be loaded through webpack
// @ts-ignore @ignore
const d = require('./commitHash')
const dotEnvFile = require('./dotEnvFile')

// Using `module.exports` instead of `export default` 'cause that's easier to configure in
// webpack.ProvidePlugin
module.exports = {
  COMMIT_HASH: d.commitHash,
  ...dotEnvFile,
  PATH_TO_ROOT: d.pathToRoot,
}
