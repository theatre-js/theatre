import type {$IntentionalAny} from '../../types'
import Stack from '../../utils/Stack'
import type {IDerivation} from '../IDerivation'

const noop = () => {}

const stack = new Stack<Collector>()
const noopCollector: Collector = noop

type Collector = (d: IDerivation<$IntentionalAny>) => void

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
    if (process.env.NODE_ENV === 'development') {
      console.warn('This should never happen')
    }
  } else {
    stack.pop()
  }
}

export const reportResolutionStart = (d: IDerivation<$IntentionalAny>) => {
  const possibleCollector = stack.peek()
  if (possibleCollector) {
    possibleCollector(d)
  }

  stack.push(noopCollector)
}

export const reportResolutionEnd = (_d: IDerivation<$IntentionalAny>) => {
  stack.pop()
}

export const isCollectingDependencies = () => {
  return stack.peek() !== noopCollector
}
