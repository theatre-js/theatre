// @flow
import type {IDerivation} from '../types'
const stack = []

export const collectObservedDependencies = (cb: () => void) => {
  const foundDeps: Set<IDerivation<$IntentionalAny>> = new Set()
  stack.push(foundDeps)
  cb()
  stack.pop()
  return foundDeps
}

export const reportObservedDependency = (d: IDerivation<$IntentionalAny>) => {
  if (stack.length === 0) return
  stack[stack.length - 1].add(d)
}