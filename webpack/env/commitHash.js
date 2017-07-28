// @flow
import childProcess from 'child_process'
// Have to use module.exports here, because 'exec-loader' doesn't support ES modules
module.exports =
  ((childProcess.execSync('git rev-parse HEAD', {encoding: 'utf8'}).trim()): string)