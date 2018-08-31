import update from 'lodash/fp/update'
import {get} from 'lodash-es'

export default function spreadPaths(
  paths: string[][],
  source: object,
  target: object,
): object {
  return paths.reduce((acc, path) => {
    return update(path, () => get(source, path), acc)
  }, target)
}
