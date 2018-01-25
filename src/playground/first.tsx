import constant from '$src/shared/DataVerse/derivations/constant'
import withDeps from '$src/shared/DataVerse/derivations/withDeps'
import {skipFindingColdDerivations} from '$src/shared/debug'
import {box} from '$src/shared/DataVerse/atoms'
import Ticker from '$src/shared/DataVerse/Ticker'
import {autoDerive} from '$src/shared/DataVerse/derivations'

// @todo what is a cold read vs hot read?

// import '$shared/DataVerse/devtoolsFormatters/setup'

// skipFindingColdDerivations()

const ticker = new Ticker()

// First lesson
const aA = box('a')
const aD = aA.derivation()
const bA = box('b')
const bD = bA.derivation()

// const abD = withDeps({aD, bD}, ({aD, bD}) => {
//   console.log('ab is getting (re)calculated')
//   return aD.getValue() + bD.getValue()
// })

const abD = autoDerive(() => {
  return aD.getValue() + bD.getValue()
})

const abPrimeD = abD.map(val => val + 'Prime')

abPrimeD.changes(ticker).tap(newValue => {
  console.log('abPrimeD changed to:', newValue)
})

aA.set('a2')
bA.set('b2')

ticker.tick()
