import {padEnd, padStart} from 'lodash-es'

export function roundestNumberBetween(_a: number, _b: number): number {
  if (_b < _a) {
    return roundestNumberBetween(_b, _a)
  }

  if (_a < 0 && _b < 0) {
    return noMinusZero(roundestNumberBetween(-_b, -_a) * -1)
  }

  if (_a <= 0 && _b >= 0) return 0

  const aCeiling = Math.ceil(_a)
  if (aCeiling <= _b) {
    return roundestIntegerBetween(aCeiling, Math.floor(_b))
  } else {
    const [a, b] = [_a, _b]
    const integer = Math.floor(a)

    return integer + roundestFloat(a - integer, b - integer)
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

const numberOfLeadingZeros = (s: string) => {
  const leadingZeroMatches = s.match(/^0+/)
  return leadingZeroMatches ? leadingZeroMatches[0].length : 0
}

const formatter = new Intl.NumberFormat('fullwide', {
  maximumFractionDigits: 10,
  useGrouping: false,
})

export const stringifyNumber = (n: number): string => {
  return formatter.format(n)
}

/**
 * it is expected that both args are 0 < arg < 1
 */
export const roundestFloat = (a: number, b: number): number => {
  const inString = {
    a: stringifyNumber(a),
    b: stringifyNumber(b),
  }
  if (inString.a === '0' || inString.b === '0') {
    return 0
  }

  const withoutInteger = {
    a: inString.a.substr(2, inString.a.length),
    b: inString.b.substr(2, inString.b.length),
  }

  const leadingZeros = {
    a: numberOfLeadingZeros(withoutInteger.a),
    b: numberOfLeadingZeros(withoutInteger.b),
  }

  const maxNumberOfLeadingZeros = Math.max(leadingZeros.a, leadingZeros.b)

  const numberOfDecimals = {
    a: withoutInteger.a.length,
    b: withoutInteger.b.length,
  }

  const maxNumberOfDecimals = Math.max(numberOfDecimals.a, numberOfDecimals.b)

  const withPaddedDecimals = {
    a: padEnd(withoutInteger.a, maxNumberOfDecimals, '0'),
    b: padEnd(withoutInteger.b, maxNumberOfDecimals, '0'),
  }

  const roundestInt = roundestIntegerBetween(
    parseInt(withPaddedDecimals.a, 10) * Math.pow(10, maxNumberOfLeadingZeros),
    parseInt(withPaddedDecimals.b, 10) * Math.pow(10, maxNumberOfLeadingZeros),
    true,
  )

  return (
    toPrecision(roundestInt / Math.pow(10, maxNumberOfLeadingZeros + maxNumberOfDecimals))
  )
}


export const numberOfDecimals = (n: number): number => {
  const num = String(getIntAndFraction(n).fraction).length
  return n % 1 > 0 ? num - 2 : 0
}

function fixal(n: number): string {
  let s: $FixMe = n
  if (Math.abs(s) < 1.0) {
    var e = parseInt(s.toString().split('e-')[1])
    if (e) {
      s *= Math.pow(10, e - 1)
      s = '0.' + new Array(e).join('0') + s.toString().substring(2)
    }
  } else {
    var e = parseInt(s.toString().split('+')[1])
    if (e > 20) {
      e -= 20
      s /= Math.pow(10, e)
      s += new Array(e + 1).join('0')
    }
  }
  return s
}

function numberToString(num: number): string {
  let numStr = String(num)

  if (Math.abs(num) < 1.0) {
    let e = parseInt(num.toString().split('e-')[1])
    if (e) {
      let negative = num < 0
      if (negative) num *= -1
      num *= Math.pow(10, e - 1)
      numStr = '0.' + new Array(e).join('0') + num.toString().substring(2)
      if (negative) numStr = '-' + numStr
    }
  } else {
    let e = parseInt(num.toString().split('+')[1])
    if (e > 20) {
      e -= 20
      num /= Math.pow(10, e)
      numStr = num.toString() + new Array(e + 1).join('0')
    }
  }

  const matches = numStr.match(/^\-?[0-9]+\.?[0-9]{0,10}/)

  if (!matches) {
    // debugger
    return numStr
  } else {
    return matches[0]
  }
}

export const toPrecision = (n: number): number => {
  // const r = parseFloat(numberToString(n))
  const fixed = parseFloat(String(n)).toFixed(10)
  const r = parseFloat(fixed)
  return r === -0 ? 0 : r
}

export const getIntAndFraction = (
  n: number,
): {int: number; fraction: number} => {
  const int = Math.floor(n)
  const fraction = toPrecision(n - int)
  return {int, fraction}
}
