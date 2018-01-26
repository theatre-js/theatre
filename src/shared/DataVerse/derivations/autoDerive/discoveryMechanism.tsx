import AbstractDerivation from '$src/shared/DataVerse/derivations/AbstractDerivation'

type Collector = (d: AbstractDerivation<$IntentionalAny>) => void

const stack: {
  foundDeps: Set<AbstractDerivation<mixed>>
  collector: Collector
}[] = []

export const collectObservedDependencies = (
  cb: () => void,
  collector: Collector,
) => {
  const foundDeps: Set<AbstractDerivation<$IntentionalAny>> = new Set()
  stack.push({foundDeps, collector})
  cb()
  stack.pop()
  return foundDeps
}

export const reportObservedDependency = (
  d: AbstractDerivation<$IntentionalAny>,
) => {
  if (stack.length === 0) return
  const top = stack[stack.length - 1]

  top.foundDeps.add(d)
  top.collector(d)
}
