import {isPointer, valueDerivation} from '../Atom'
import type {Pointer} from '../pointer'
import type {IDerivation} from './IDerivation'
import {isDerivation} from './IDerivation'

export default function* iterateAndCountTicks<V>(
  pointerOrDerivation: IDerivation<V> | Pointer<V>,
): Generator<{value: V; ticks: number}, void, void> {
  let d
  if (isPointer(pointerOrDerivation)) {
    d = valueDerivation(pointerOrDerivation) as IDerivation<V>
  } else if (isDerivation(pointerOrDerivation)) {
    d = pointerOrDerivation
  } else {
    throw new Error(`Only pointers and derivations are supported`)
  }

  let ticksCountedSinceLastYield = 0
  const untap = d.changes().tap(() => {
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
