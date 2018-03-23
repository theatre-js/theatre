// @ts-ignore @ignore
import {commitHash, pathToRoot} from 'exec-loader!./commitHash'
import dotEnvFile from './dotEnvFile'

// Using `module.exports` instead of `export default` 'cause that's easier to configure in
// webpack.ProvidePlugin
module.exports = {COMMIT_HASH: commitHash, ...dotEnvFile, PATH_TO_ROOT: pathToRoot}