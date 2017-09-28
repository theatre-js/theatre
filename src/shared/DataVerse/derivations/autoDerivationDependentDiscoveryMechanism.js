// @flow
import type {default as Derivation} from './Derivation'
const stack = []

export const collectObservedDependencies = (cb) => {
  const foundDeps: Set<Derivation<$IntentionalAny>> = new Set()
  stack.push(foundDeps)
  cb()
  stack.pop()
  return foundDeps
}

export const reportObservedDependency = (d: Derivation<$IntentionalAny>) => {
  if (stack.length === 0) return
  stack[stack.length - 1].add(d)
}