// @ts-ignore @ignore
import d from 'exec-loader!./commitHash'
import dotEnvFile from './dotEnvFile'

// Using `module.exports` instead of `export default` 'cause that's easier to configure in
// webpack.ProvidePlugin
module.exports = {COMMIT_HASH: d.commitHash, ...dotEnvFile, PATH_TO_ROOT: d.pathToRoot}