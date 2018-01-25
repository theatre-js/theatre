import {dict} from '$src/shared/DataVerse/atoms'
import {skipFindingColdDerivations} from '$src/shared/debug'
skipFindingColdDerivations()

const firstA = dict({a: 1, b: 2})
const firstD = firstA.derivedDict()
const firstDPrime = firstD.mapValues((propD) => propD.map((propV) => propV + 10))

const secondA = dict({a: 'hello', c: 3, d: 4})
const secondD = secondA.derivedDict()

const firstAndSecondD = firstDPrime.extend(secondD)

console.log(firstAndSecondD.prop('a').getValue())



