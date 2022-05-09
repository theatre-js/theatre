import type {IUtilContext} from '@theatre/shared/logger'
import {
  getLastMultipleOf,
  numberOfDecimals,
  roundestFloat,
  roundestIntegerBetween,
  roundestNumberBetween,
  toPrecision,
} from './numberRoundingUtils'
import type {$IntentionalAny} from './types'

const example = <Args extends $IntentionalAny[], Return>(
  fn: (...args: Args) => Return,
  args: Args,
  expectation: Return,
  opts: Partial<{skip: boolean; debug: boolean}> = {},
) => {
  ;(opts.skip ? it.skip : it)(
    `${fn.name}(${args.join(', ')}) => ${expectation}`,
    () => {
      // @ts-expect-error @ignore
      if (opts.debug) global.dbg = true
      const val = fn(...args)
      // @ts-expect-error @ignore
      global.dbg = false
      expect(val).toEqual(expectation)
    },
  )
}

const CTX: IUtilContext = {
  get logger(): never {
    throw new Error('unexpected logger access in test example')
  },
}

describe(`numberRoundingUtils()`, () => {
  describe(`roundestNumberBetween()`, () => {
    example(roundestNumberBetween, [CTX, 0.1, 1.1], 1)
    example(roundestNumberBetween, [CTX, 0.1111111123, 0.2943439448], 0.25)
    example(roundestNumberBetween, [CTX, 0.19, 0.23], 0.2)
    example(roundestNumberBetween, [CTX, -0.19, 0.23], 0)
    example(roundestNumberBetween, [CTX, -0.19, -0.02], -0.1, {debug: false})
    example(roundestNumberBetween, [CTX, -0.19, -0.022], -0.1, {debug: false})
    example(roundestNumberBetween, [CTX, -0.19, -0.022234324], -0.1, {
      debug: false,
    })
    example(roundestNumberBetween, [CTX, -0.19, 0.0222222], 0)
    example(roundestNumberBetween, [CTX, -0.19, 0.02], 0)
    example(
      roundestNumberBetween,
      [CTX, 22304.2398427391, 22304.2398427393],
      22304.2398427392,
    )
    example(roundestNumberBetween, [CTX, 22304.2398427391, 22304.4], 22304.25)
    example(roundestNumberBetween, [CTX, 902, 901], 902)
    example(roundestNumberBetween, [CTX, -10, -5], -10)
    example(roundestNumberBetween, [CTX, -5, -10], -10)
    example(roundestNumberBetween, [CTX, -10, -5], -10)
    example(
      roundestNumberBetween,
      [CTX, -0.00876370109231405, -2.909374013346118e-50],
      0,
      {debug: false},
    )
    example(
      roundestNumberBetween,
      [CTX, 0.059449443526800295, 0.06682093143783596],
      0.06,
      {debug: false},
    )
    const getRandomNumber = () => {
      const sign = Math.random() > 0.5 ? 1 : -1
      return (
        (Math.pow(Math.random(), Math.random()) /
          Math.pow(10, Math.random() * 100)) *
        sign
      )
    }
    test(`roundestNumberBetween() => fuzzy`, () => {
      for (let i = 0; i < 2000; i++) {
        const from = toPrecision(getRandomNumber())
        const to = toPrecision(getRandomNumber())

        const result = roundestNumberBetween(CTX, from, to)
        if (from < to) {
          if (result < from || result > to) {
            throw new Error(`Invalid: ${from} ${to} ${result}`)
          }
        } else {
          if (result > from || result < to) {
            throw new Error(`Invalid: ${to} ${from} ${result}`)
          }
        }
      }
    })
  })
  describe(`roundestIntegerBetween`, () => {
    example(roundestIntegerBetween, [CTX, -1, 6], 0, {})
    example(roundestIntegerBetween, [CTX, 0, 6], 0, {})
    example(roundestIntegerBetween, [CTX, -1, 0], 0, {})
    example(roundestIntegerBetween, [CTX, -1850, -1740], -1750, {})
    example(roundestIntegerBetween, [CTX, 1, 6], 5, {})
    example(roundestIntegerBetween, [CTX, 1, 5], 5)
    example(roundestIntegerBetween, [CTX, 1, 2], 2)
    example(roundestIntegerBetween, [CTX, 1, 10], 10)
    example(roundestIntegerBetween, [CTX, 1, 12], 10)
    example(roundestIntegerBetween, [CTX, 11, 15], 15)
    example(roundestIntegerBetween, [CTX, 101, 102], 102, {debug: true})
    example(roundestIntegerBetween, [CTX, 11, 14, false], 12)
    example(roundestIntegerBetween, [CTX, 11, 14, true], 12.5)
    example(roundestIntegerBetween, [CTX, 11, 12], 12)
    example(roundestIntegerBetween, [CTX, 11, 12], 12, {})
    example(roundestIntegerBetween, [CTX, 10, 90], 50)
    example(roundestIntegerBetween, [CTX, 10, 100], 100)
    example(roundestIntegerBetween, [CTX, 10, 110], 100)
    example(roundestIntegerBetween, [CTX, 9, 100], 10)
    example(roundestIntegerBetween, [CTX, 9, 1100], 10)
    example(roundestIntegerBetween, [CTX, 9, 699], 10)
    example(roundestIntegerBetween, [CTX, 9, 400], 10)
    example(roundestIntegerBetween, [CTX, 9, 199], 10)
    example(roundestIntegerBetween, [CTX, 9, 1199], 10)
    example(roundestIntegerBetween, [CTX, 1921, 1998], 1950)
    example(roundestIntegerBetween, [CTX, 1921, 2020], 2000)
    example(roundestIntegerBetween, [CTX, 1601, 1998], 1750)
    example(roundestIntegerBetween, [CTX, 1919, 1921], 1920)
    example(roundestIntegerBetween, [CTX, 1919, 1919], 1919)
    example(roundestIntegerBetween, [CTX, 3901, 3902], 3902)
    example(roundestIntegerBetween, [CTX, 901, 902], 902)
  })
  describe(`roundestFloat()`, () => {
    example(roundestFloat, [CTX, 0.19, 0.2122], 0.2)
    example(roundestFloat, [CTX, 0.19, 0.31], 0.25)
    example(roundestFloat, [CTX, 0.19, 0.41], 0.25)
    example(roundestFloat, [CTX, 0.19, 1.9], 0.5)
  })
  describe(`numberOfDecimals()`, () => {
    example(numberOfDecimals, [1.1], 1)
    example(numberOfDecimals, [1.12], 2)
    example(numberOfDecimals, [1], 0)
    example(numberOfDecimals, [10], 0)
    example(numberOfDecimals, [0.1 + 0.2], 1)
    example(numberOfDecimals, [0.12399993], 8)
    example(numberOfDecimals, [0.12399993], 8)
    example(numberOfDecimals, [0.123999931], 9)
    example(numberOfDecimals, [0.1239999312], 10)
    example(numberOfDecimals, [0.12399993121], 10)
  })

  describe(`toPrecision()`, () => {
    example(toPrecision, [1.1], 1.1)
    example(toPrecision, [0.1 + 0.2], 0.3)
    example(toPrecision, [0.3 - 0.3], 0)
    example(toPrecision, [0.4 - 0.1], 0.3)
    example(toPrecision, [1.4 - 0.1], 1.3)
  })

  describe(`getLastMultipleOf()`, () => {
    example(getLastMultipleOf, [1, 10], 0)
    example(getLastMultipleOf, [11, 10], 10)
    example(getLastMultipleOf, [11, 5], 10)
    example(getLastMultipleOf, [11, 2], 10)
    example(getLastMultipleOf, [4, 2], 4)
  })
})
