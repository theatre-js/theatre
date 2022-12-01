import {valueDerivation} from '../Atom'
import type {Pointer} from '../pointer'
import {isPointer} from '../pointer'
import type {Prism} from './Interface'
import {isPrism} from './Interface'

export default function* iterateAndCountTicks<V>(
  pointerOrDerivation: Prism<V> | Pointer<V>,
): Generator<{value: V; ticks: number}, void, void> {
  let d
  if (isPointer(pointerOrDerivation)) {
    d = valueDerivation(pointerOrDerivation) as Prism<V>
  } else if (isPrism(pointerOrDerivation)) {
    d = pointerOrDerivation
  } else {
    throw new Error(`Only pointers and derivations are supported`)
  }

  let ticksCountedSinceLastYield = 0
  const untap = d.onStale(() => {
    ticksCountedSinceLastYield++
  })

  try {
    while (true) {
      const ticks = ticksCountedSinceLastYield
      ticksCountedSinceLastYield = 0
      yield {value: d.getValue(), ticks}
    }
  } finally {
    untap()
  }
}
