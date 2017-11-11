// @flow
import type {IDerivation} from '../types'
const stack = []

export const collectObservedDependencies = (
  cb: () => void,
  collector: (IDerivation<$IntentionalAny>) => void,
) => {
  const foundDeps: Set<IDerivation<$IntentionalAny>> = new Set()
  stack.push({foundDeps, collector})
  cb()
  stack.pop()
  return foundDeps
}

export const reportObservedDependency = (d: IDerivation<$IntentionalAny>) => {
  if (stack.length === 0) return
  const top = stack[stack.length - 1]

  top.foundDeps.add(d)
  top.collector(d)
}
