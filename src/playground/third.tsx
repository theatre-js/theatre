import {array} from '$src/shared/DataVerse/atoms'
import {skipFindingColdDerivations} from '$src/shared/debug'
import {Ticker} from '$src/shared/DataVerse'
skipFindingColdDerivations()

const rA = array([0, 1, 2])
const rD = rA.derivedArray()

const rDPrime = rD.map(vD => vD.map(v => v + 1))

const i1D = rDPrime.index(1)
// console.log(rD);

const ticker = new Ticker()

i1D.changes(ticker).tap(i1Value => {
  console.log('i1:', i1Value)
})

rA.setIndex(1, 11)

ticker.tick()
