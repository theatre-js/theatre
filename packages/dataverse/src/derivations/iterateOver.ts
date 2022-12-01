import {valueDerivation} from '../Atom'
import type {Pointer} from '../pointer'
import {isPointer} from '../pointer'
import Ticker from '../Ticker'
import type {Prism} from './Interface'
import {isPrism} from './Interface'

export default function* iterateOver<V>(
  pointerOrDerivation: Prism<V> | Pointer<V>,
): Generator<V, void, void> {
  let d
  if (isPointer(pointerOrDerivation)) {
    d = valueDerivation(pointerOrDerivation) as Prism<V>
  } else if (isPrism(pointerOrDerivation)) {
    d = pointerOrDerivation
  } else {
    throw new Error(`Only pointers and derivations are supported`)
  }

  const ticker = new Ticker()

  const untap = d.onChange(ticker, (v) => {})

  try {
    while (true) {
      ticker.tick()

      yield d.getValue()
    }
  } finally {
    untap()
  }
}
