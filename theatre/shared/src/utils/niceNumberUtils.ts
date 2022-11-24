import padEnd from 'lodash-es/padEnd'
import logger from '@theatre/shared/logger'

/**
 * Returns the _aesthetically pleasing_ (aka "nicest") number `c`, such that `a <= c <= b`.
 * This is useful when a numeric value is being "nudged" by the user (e.g. dragged via mouse pointer),
 * and we want to avoid setting it to weird value like `101.1239293814314`, when we know that the user
 * probably just meant `100`.
 *
 * Examples
 * ```ts
 * nicestNumberBetween(0.1111111123, 0.2943439448) // 0.25
 * nicestNumberBetween(0.19, 0.23) // 0.2
 * nicestNumberBetween(1921, 1998) // 1950
 * nicestNumberBetween(10, 110) // 100
 * // There are more examples at `./niceNumberUtils.test.ts`
 * ```
 */
export function nicestNumberBetween(_a: number, _b: number): number {
  if (_b < _a) {
    return nicestNumberBetween(_b, _a)
  }

  if (_a < 0 && _b < 0) {
    return noMinusZero(nicestNumberBetween(-_b, -_a) * -1)
  }

  if (_a <= 0 && _b >= 0) return 0

  const aCeiling = Math.ceil(_a)
  if (aCeiling <= _b) {
    return nicestIntegerBetween(aCeiling, Math.floor(_b))
  } else {
    const [a, b] = [_a, _b]
    const integer = Math.floor(a)

    return integer + nicestFloatBetween(a - integer, b - integer)
  }
}

// const multiplesOfInterest = [10, 5, 4, 2]
const halvesAndQuartiles = [5, 2.5, 7.5]
const multipliersWithoutQuartiles = [5, 2, 4, 6, 8, 1, 3, 7, 9]

export function nicestIntegerBetween(
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
      logger.error(`Coudn't find a human-readable number between ${a} and ${b}`)
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

let formatter: Intl.NumberFormat

try {
  formatter = new Intl.NumberFormat('fullwide', {
    maximumFractionDigits: 10,
    useGrouping: false,
  })
} catch (e) {}

export const stringifyNumber = (n: number): string => {
  return formatter.format(n)
}

/**
 * The float-specific version of {@link nicestNumberBetween}.
 *
 * it is expected that both args are 0 \< arg \< 1
 */
export const nicestFloatBetween = (a: number, b: number): number => {
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

  const mostAestheticInt = nicestIntegerBetween(
    parseInt(withPaddedDecimals.a, 10) * Math.pow(10, maxNumberOfLeadingZeros),
    parseInt(withPaddedDecimals.b, 10) * Math.pow(10, maxNumberOfLeadingZeros),
    true,
  )

  return toPrecision(
    mostAestheticInt /
      Math.pow(10, maxNumberOfLeadingZeros + maxNumberOfDecimals),
  )
}

export const numberOfDecimals = (n: number): number => {
  const num = String(getIntAndFraction(n).fraction).length
  return n % 1 > 0 ? num - 2 : 0
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
