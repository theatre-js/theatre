import {isPointer, valueDerivation} from '../Atom'
import type {Pointer} from '../pointer'
import Ticker from '../Ticker'
import type {IDerivation} from './IDerivation'
import {isDerivation} from './IDerivation'

export default function* iterateOver<V>(
  pointerOrDerivation: IDerivation<V> | Pointer<V>,
): Generator<V, void, void> {
  let d
  if (isPointer(pointerOrDerivation)) {
    d = valueDerivation(pointerOrDerivation) as IDerivation<V>
  } else if (isDerivation(pointerOrDerivation)) {
    d = pointerOrDerivation
  } else {
    throw new Error(`Only pointers and derivations are supported`)
  }

  const ticker = new Ticker()

  const untap = d.changes().tap((v) => {})

  try {
    while (true) {
      ticker.tick()

      yield d.getValue()
    }
  } finally {
    untap()
  }
}
