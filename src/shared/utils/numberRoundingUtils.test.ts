import {
  numberOfDecimals,
  toPrecision,
  getLastMultipleOf,
} from './numberRoundingUtils'
import {
  roundestNumberBetween,
  roundestIntegerBetween,
  roundestFloat,
} from './numberRoundingUtils'

const example = <Args extends $IntentionalAny[], Return>(
  fn: (...args: Args) => Return,
  args: Args,
  expectation: Return,
  opts: Partial<{skip: boolean; debug: boolean}> = {},
) => {
  ;(opts.skip ? it.skip : it)(
    `${fn.name}(${args.join(', ')}) => ${expectation}`,
    () => {
      // @ts-ignore @ignore
      if (opts.debug) global.dbg = true
      const val = fn(...args)
      // @ts-ignore @ignore
      global.dbg = false
      expect(val).toEqual(expectation)
    },
  )
}

describe(`numberRoundingUtils()`, () => {
  describe(`roundestNumberBetween()`, () => {
    example(roundestNumberBetween, [0.1, 1.1], 1)
    example(roundestNumberBetween, [0.1111111123, 0.2943439448], 0.25)
    example(roundestNumberBetween, [0.19, 0.23], 0.2)
    example(roundestNumberBetween, [-0.19, 0.23], 0)
    example(roundestNumberBetween, [-0.19, -0.02], -0.1)
    example(roundestNumberBetween, [-0.19, 0.02], 0)
    example(
      roundestNumberBetween,
      [22304.2398427391, 22304.2398427393],
      22304.2398427392,
    )
    example(roundestNumberBetween, [22304.2398427391, 22304.4], 22304.25)
  })
  describe(`roundestIntegerBetween`, () => {
    example(roundestIntegerBetween, [-1, 6], 0, {})
    example(roundestIntegerBetween, [0, 6], 0, {})
    example(roundestIntegerBetween, [-1, 0], 0, {})
    example(roundestIntegerBetween, [-1850, -1740], -1750, {})
    example(roundestIntegerBetween, [1, 6], 5, {})
    example(roundestIntegerBetween, [1, 5], 5)
    example(roundestIntegerBetween, [1, 2], 2)
    example(roundestIntegerBetween, [1, 10], 10)
    example(roundestIntegerBetween, [1, 12], 10)
    example(roundestIntegerBetween, [11, 15], 15)
    example(roundestIntegerBetween, [101, 102], 102, {debug: true})
    example(roundestIntegerBetween, [11, 14, false], 12)
    example(roundestIntegerBetween, [11, 14, true], 12.5)
    example(roundestIntegerBetween, [11, 12], 12)
    example(roundestIntegerBetween, [11, 12], 12, {})
    example(roundestIntegerBetween, [10, 90], 50)
    example(roundestIntegerBetween, [10, 100], 100)
    example(roundestIntegerBetween, [10, 110], 100)
    example(roundestIntegerBetween, [9, 100], 10)
    example(roundestIntegerBetween, [9, 1100], 10)
    example(roundestIntegerBetween, [9, 699], 10)
    example(roundestIntegerBetween, [9, 400], 10)
    example(roundestIntegerBetween, [9, 199], 10)
    example(roundestIntegerBetween, [9, 1199], 10)
    example(roundestIntegerBetween, [1921, 1998], 1950)
    example(roundestIntegerBetween, [1921, 2020], 2000)
    example(roundestIntegerBetween, [1601, 1998], 1750)
    example(roundestIntegerBetween, [1919, 1921], 1920)
    example(roundestIntegerBetween, [1919, 1919], 1919)
    example(roundestIntegerBetween, [3901, 3902], 3902)
    example(roundestIntegerBetween, [901, 902], 902)
  })
  describe(`roundestFloat()`, () => {
    example(roundestFloat, [0.19, 0.2122], 0.2)
    example(roundestFloat, [0.19, 0.31], 0.25)
    example(roundestFloat, [0.19, 0.41], 0.25)
    example(roundestFloat, [0.19, 1.9], 0.5)
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
