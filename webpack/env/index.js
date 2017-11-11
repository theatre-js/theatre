// @flow
import commitHash from 'exec-loader!./commitHash'
import dotEnvFile from './dotEnvFile'

// Using `module.exports` instead of `export default` 'cause that's easier to configure in
// webpack.ProvidePlugin
module.exports = {COMMIT_HASH: commitHash, ...dotEnvFile}