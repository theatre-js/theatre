// @flow
import commitHash from 'exec-loader!./commitHash'
import dotEnvFile from './dotEnvFile'

console.log(commitHash)

// Using `module.exports` instead of `export default` 'cause that's easier to configure in
// webpack.ProvidePlugin
module.exports = {COMMIT_HASH: commitHash, ...dotEnvFile}