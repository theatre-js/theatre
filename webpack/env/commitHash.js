import childProcess from 'child_process'
import path from 'path'
// Have to use module.exports here, because 'exec-loader' doesn't support ES modules
module.exports = {
  commitHash: childProcess
    .execSync('git rev-parse HEAD', {encoding: 'utf8'})
    .trim(),
  pathToRoot: path.join(__dirname, '../../'),
}