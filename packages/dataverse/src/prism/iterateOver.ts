import {pointerToPrism} from '../pointerToPrism'
import type {Pointer} from '../pointer'
import {isPointer} from '../pointer'
import Ticker from '../Ticker'
import type {Prism} from './Interface'
import {isPrism} from './Interface'

export default function* iterateOver<V>(
  pointerOrPrism: Prism<V> | Pointer<V>,
): Generator<V, void, void> {
  let d
  if (isPointer(pointerOrPrism)) {
    d = pointerToPrism(pointerOrPrism) as Prism<V>
  } else if (isPrism(pointerOrPrism)) {
    d = pointerOrPrism
  } else {
    throw new Error(`Only pointers and prisms are supported`)
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
