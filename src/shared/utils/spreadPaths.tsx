import {get, updateImmutable as update} from '$shared/utils'

export default function spreadPaths(
  paths: string[][],
  source: object,
  target: object,
): object {
  return paths.reduce((acc, path) => {
    return update(path, () => get(source, path), acc)
  }, target)
}
