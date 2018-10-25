import {padEnd} from 'lodash-es'

export function roundestNumberBetween(_a: number, _b: number): number {
  if (_b < _a) {
    return roundestNumberBetween(_b, _a)
  }

  const aCeiling = Math.ceil(_a)
  if (aCeiling <= _b) {
    return roundestIntegerBetween(
      noMinusZero(aCeiling),
      noMinusZero(Math.floor(_b)),
    )
  } else {
    const {a, b, fixSign} =
      _a < 0 ? {a: -_b, b: -_a, fixSign: -1} : {a: _a, b: _b, fixSign: 1}
    const integer = Math.floor(a)

    return (integer + roundestFloat(a - integer, b - integer)) * fixSign
  }
}

// const multiplesOfInterest = [10, 5, 4, 2]
const halvesAndQuartiles = [5, 2.5, 7.5]
const multipliersWithoutQuartiles = [5, 2, 4, 6, 8, 1, 3, 7, 9]

export function roundestIntegerBetween(
  _a: number,
  _b: number,
  decimalsAllowed: boolean = true,
): number {
  if (_a === 0 || (_a < 0 && _b >= 0)) return 0
  const {a, b, fixSign} =
    _a < 0 ? {a: -_b, b: -_a, fixSign: -1} : {a: _a, b: _b, fixSign: 1}

  const largestExponentiationOfTenSmallerThanOrEqualToA = Math.pow(
    10,
    String(a).length - 1,
  )

  const nextExponentiation =
    largestExponentiationOfTenSmallerThanOrEqualToA * 10

  if (nextExponentiation >= a && nextExponentiation <= b)
    return nextExponentiation * fixSign

  let base = 0
  let currentExponentiationOfTen =
    largestExponentiationOfTenSmallerThanOrEqualToA || 1

  let i = 0
  while (true) {
    if (i++ > 100) {
      return NaN
    }
    if (currentExponentiationOfTen > 1 || decimalsAllowed) {
      for (const multiplier of halvesAndQuartiles) {
        const toAdd = multiplier * currentExponentiationOfTen
        const total = toAdd + base
        if (total >= a && total <= b) return total * fixSign
      }
    }

    let highestTotalFound = base
    for (const multiplier of multipliersWithoutQuartiles) {
      const toAdd = multiplier * currentExponentiationOfTen
      const total = base + toAdd
      if (total >= a && total <= b) {
        return total * fixSign
      } else if (total <= a && total > highestTotalFound) {
        highestTotalFound = total
      }
    }
    base = highestTotalFound

    if (currentExponentiationOfTen === 1) {
      debugger
      console.error(
        `Coudn't find a human-readable number between ${a} and ${b}`,
      )
      return _a
    } else {
      currentExponentiationOfTen /= 10
    }
  }
}

export function nextBestIntegerBetween(a: number, b: number): number {
  if (b == Infinity) {
    if (a === 0) {
      return 10
    } else {
      return a * 10
    }
  } else {
    const diff = b - a
    return diff / 2
  }
}

export const getLastMultipleOf = (n: number, multipleOf: number): number => {
  const m = n % multipleOf
  return n - m
}

const noMinusZero = (a: number): number => (a === -0 ? 0 : a)

/**
 * it is expected that both args are 0 < arg < 1
 */
export const roundestFloat = (_a: number, _b: number): number => {
  const a = toPrecision(_a)
  const b = toPrecision(_b)
  const numberOfDecimalsInA = numberOfDecimals(a)
  const numberOfDecimalsInB = numberOfDecimals(b)
  const maxNumberOfDecimals = Math.max(numberOfDecimalsInA, numberOfDecimalsInB)
  const sA = padEnd(String(a), maxNumberOfDecimals + 2, '0').substr(
    2,
    maxNumberOfDecimals,
  )
  const sB = padEnd(String(b), maxNumberOfDecimals + 2, '0').substr(
    2,
    maxNumberOfDecimals,
  )
  const intA = parseInt(sA, 10)
  const intB = parseInt(sB, 10)
  const roundestInt = roundestIntegerBetween(intA, intB, true)
  const finalString = '0.' + String(roundestInt)

  return toPrecision(parseFloat(finalString))
}

export const numberOfDecimals = (n: number): number => {
  const num = String(getIntAndFraction(n).fraction).length
  return n % 1 > 0 ? num - 2 : 0
}

export const toPrecision = (n: number): number => {
  const fixed = n.toFixed(10)
  return parseFloat(fixed)
}

export const getIntAndFraction = (
  n: number,
): {int: number; fraction: number} => {
  const int = Math.floor(n)
  const fraction = toPrecision(n - int)
  return {int, fraction}
}
