import type {$IntentionalAny} from '../../types'
import Stack from '../../utils/Stack'
import type {IDerivation} from '../IDerivation'

function createMechanism() {
  const noop = () => {}

  const stack = new Stack<Collector>()
  const noopCollector: Collector = noop

  type Collector = (d: IDerivation<$IntentionalAny>) => void

  const collectObservedDependencies = (
    cb: () => void,
    collector: Collector,
  ) => {
    stack.push(collector)
    cb()
    stack.pop()
  }

  const startIgnoringDependencies = () => {
    stack.push(noopCollector)
  }

  const stopIgnoringDependencies = () => {
    if (stack.peek() !== noopCollector) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('This should never happen')
      }
    } else {
      stack.pop()
    }
  }

  const reportResolutionStart = (d: IDerivation<$IntentionalAny>) => {
    const possibleCollector = stack.peek()
    if (possibleCollector) {
      possibleCollector(d)
    }

    stack.push(noopCollector)
  }

  const reportResolutionEnd = (_d: IDerivation<$IntentionalAny>) => {
    stack.pop()
  }

  const isCollectingDependencies = () => {
    return stack.peek() !== noopCollector
  }

  return {
    type: 'Dataverse_discoveryMechanism' as 'Dataverse_discoveryMechanism',
    collectObservedDependencies,
    startIgnoringDependencies,
    stopIgnoringDependencies,
    reportResolutionStart,
    reportResolutionEnd,
    isCollectingDependencies,
  }
}

function getSharedMechanism(): ReturnType<typeof createMechanism> {
  const varName = '__dataverse_discoveryMechanism_sharedStack'
  if (global) {
    const existingMechanism: ReturnType<typeof createMechanism> | undefined =
      // @ts-ignore ignore
      global[varName]
    if (
      existingMechanism &&
      typeof existingMechanism === 'object' &&
      existingMechanism.type === 'Dataverse_discoveryMechanism'
    ) {
      return existingMechanism
    } else {
      const mechanism = createMechanism()
      // @ts-ignore ignore
      global[varName] = mechanism
      return mechanism
    }
  } else {
    return createMechanism()
  }
}

export const {
  collectObservedDependencies,
  startIgnoringDependencies,
  stopIgnoringDependencies,
  reportResolutionEnd,
  reportResolutionStart,
  isCollectingDependencies,
} = getSharedMechanism()
