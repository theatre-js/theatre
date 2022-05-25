import type {$IntentionalAny} from '../../types'
import Stack from '../../utils/Stack'
import type {IDerivation} from '../IDerivation'

function createMechanism() {
  const noop = () => {}

  const stack = new Stack<Collector>()
  const noopCollector: Collector = noop

  type Collector = (d: IDerivation<$IntentionalAny>) => void

  const pushCollector = (collector: Collector): void => {
    stack.push(collector)
  }

  const popCollector = (collector: Collector): void => {
    const existing = stack.peek()
    if (existing !== collector) {
      throw new Error(`Popped collector is not on top of the stack`)
    }
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

  return {
    type: 'Dataverse_discoveryMechanism' as 'Dataverse_discoveryMechanism',
    startIgnoringDependencies,
    stopIgnoringDependencies,
    reportResolutionStart,
    reportResolutionEnd,
    pushCollector,
    popCollector,
  }
}

function getSharedMechanism(): ReturnType<typeof createMechanism> {
  const varName = '__dataverse_discoveryMechanism_sharedStack'
  const root =
    typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {}
  if (root) {
    const existingMechanism: ReturnType<typeof createMechanism> | undefined =
      // @ts-ignore ignore
      root[varName]
    if (
      existingMechanism &&
      typeof existingMechanism === 'object' &&
      existingMechanism.type === 'Dataverse_discoveryMechanism'
    ) {
      return existingMechanism
    } else {
      const mechanism = createMechanism()
      // @ts-ignore ignore
      root[varName] = mechanism
      return mechanism
    }
  } else {
    return createMechanism()
  }
}

export const {
  startIgnoringDependencies,
  stopIgnoringDependencies,
  reportResolutionEnd,
  reportResolutionStart,
  pushCollector,
  popCollector,
} = getSharedMechanism()
