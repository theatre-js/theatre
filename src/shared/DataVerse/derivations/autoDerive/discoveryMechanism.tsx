import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import Stack from '$shared/utils/Stack'
import noop from '$shared/utils/noop'

const stack = new Stack<Collector>()
const noopCollector: Collector = noop

type Collector = (d: AbstractDerivation<$IntentionalAny>) => void

export const collectObservedDependencies = (
  cb: () => void,
  collector: Collector,
) => {
  stack.push(collector)
  cb()
  stack.pop()
}

export const startIgnoringDependencies = () => {
  stack.push(noopCollector)
}

export const stopIgnoringDependencies = () => {
  if (stack.peek() !== noopCollector) {
    if ($env.NODE_ENV === 'development') {
      console.warn("This should never happen")
    }
  } else {
    stack.pop()
  }
}

export const reportResolutionStart = (
  d: AbstractDerivation<$IntentionalAny>,
) => {
  const possibleCollector = stack.peek()
  if (possibleCollector) {
    possibleCollector(d)
  }

  stack.push(noopCollector)
}

export const reportResolutionEnd = (d: AbstractDerivation<$IntentionalAny>) => {
  stack.pop()
}

export const isCollectingDependencies = () => {
  return stack.peek() !== noopCollector
}
