import {box} from '$src/shared/DataVerse/atoms'
import constant from '$src/shared/DataVerse/derivations/constant'

const switchA = box('a')
const switchD = switchA.derivation()

const aD = constant(1)
const bD = constant(2)

const finalD = switchD.flatMap(
  (eitherAOrB: 'a' | 'b') => (eitherAOrB === 'a' ? aD : bD),
)

console.log(finalD.getValue())
