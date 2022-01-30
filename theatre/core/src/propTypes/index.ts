import type {$IntentionalAny} from '@theatre/shared/utils/types'
import userReadableTypeOfValue from '@theatre/shared/utils/userReadableTypeOfValue'
import type {Rgba, Laba} from '@theatre/shared/utils/color'
import {decorateRgba} from '@theatre/shared/utils/color'
import {mapValues} from 'lodash-es'
import type {
  IShorthandCompoundProps,
  IValidCompoundProps,
  ShorthandCompoundPropsToLonghandCompoundProps,
} from './internals'
import {sanitizeCompoundProps} from './internals'
import {propTypeSymbol} from './internals'

const validateCommonOpts = (fnCallSignature: string, opts?: CommonOpts) => {
  if (process.env.NODE_ENV !== 'production') {
    if (opts === undefined) return
    if (typeof opts !== 'object' || opts === null) {
      throw new Error(
        `opts in ${fnCallSignature} must either be undefined or an object.`,
      )
    }
    if (Object.prototype.hasOwnProperty.call(opts, 'label')) {
      const {label} = opts
      if (typeof label !== 'string') {
        throw new Error(
          `opts.label in ${fnCallSignature} should be a string. ${userReadableTypeOfValue(
            label,
          )} given.`,
        )
      }
      if (label.trim().length !== label.length) {
        throw new Error(
          `opts.label in ${fnCallSignature} should not start/end with whitespace. "${label}" given.`,
        )
      }
      if (label.length === 0) {
        throw new Error(
          `opts.label in ${fnCallSignature} should not be an empty string. If you wish to have no label, remove opts.label from opts.`,
        )
      }
    }
  }
}

/**
 * A compound prop type (basically a JS object).
 *
 * @example
 * Usage:
 * ```ts
 * // shorthand
 * const position = {
 *   x: 0,
 *   y: 0
 * }
 * assert(sheet.object('some object', position).value.x === 0)
 *
 * // nesting
 * const foo = {bar: {baz: {quo: 0}}}
 * assert(sheet.object('some object', foo).bar.baz.quo === 0)
 *
 * // With additional options:
 * const position = t.compound(
 *   {x: 0, y: 0},
 *   // a custom label for the prop:
 *   {label: "Position"}
 * )
 * ```
 *
 */
export const compound = <Props extends IShorthandCompoundProps>(
  props: Props,
  opts?: {
    label?: string
  },
): PropTypeConfig_Compound<
  ShorthandCompoundPropsToLonghandCompoundProps<Props>,
  Props
> => {
  validateCommonOpts('t.compound(props, opts)', opts)
  const sanitizedProps = sanitizeCompoundProps(props)
  return {
    type: 'compound',
    props: sanitizedProps,
    valueType: null as $IntentionalAny,
    [propTypeSymbol]: 'TheatrePropType',
    label: opts?.label,
    default: mapValues(sanitizedProps, (p) => p.default) as $IntentionalAny,
  }
}

/**
 * A number prop type.
 *
 * @example
 * Usage
 * ```ts
 * // shorthand:
 * const obj = sheet.object('key', {x: 0})
 *
 * // With options (equal to above)
 * const obj = sheet.object('key', {
 *   x: t.number(0)
 * })
 *
 * // With a range (note that opts.range is just a visual guide, not a validation rule)
 * const x = t.number(0, {range: [0, 10]}) // limited to 0 and 10
 *
 * // With custom nudging
 * const x = t.number(0, {nudgeMultiplier: 0.1}) // nudging will happen in 0.1 increments
 *
 * // With custom nudging function
 * const x = t.number({
 *   nudgeFn: (
 *     // the mouse movement (in pixels)
 *     deltaX: number,
 *     // the movement as a fraction of the width of the number editor's input
 *     deltaFraction: number,
 *     // A multiplier that's usually 1, but might be another number if user wants to nudge slower/faster
 *     magnitude: number,
 *     // the configuration of the number
 *     config: {nudgeMultiplier?: number; range?: [number, number]},
 *   ): number => {
 *     return deltaX * magnitude
 *   },
 * })
 * ```
 *
 * @param defaultValue - The default value (Must be a finite number)
 * @param opts - The options (See usage examples)
 * @returns A number prop config
 */
export const number = (
  defaultValue: number,
  opts?: {
    nudgeFn?: PropTypeConfig_Number['nudgeFn']
    range?: PropTypeConfig_Number['range']
    nudgeMultiplier?: number
    label?: string
    sanitize?: Sanitizer<number>
    interpolate?: Interpolator<number>
  },
): PropTypeConfig_Number => {
  if (process.env.NODE_ENV !== 'production') {
    validateCommonOpts('t.number(defaultValue, opts)', opts)
    if (typeof defaultValue !== 'number' || !isFinite(defaultValue)) {
      throw new Error(
        `Argument defaultValue in t.number(defaultValue) must be a number. ${userReadableTypeOfValue(
          defaultValue,
        )} given.`,
      )
    }
    if (typeof opts === 'object' && opts !== null) {
      if (Object.prototype.hasOwnProperty.call(opts, 'range')) {
        if (!Array.isArray(opts.range)) {
          throw new Error(
            `opts.range in t.number(defaultValue, opts) must be a tuple of two numbers. ${userReadableTypeOfValue(
              opts.range,
            )} given.`,
          )
        }
        if (opts.range.length !== 2) {
          throw new Error(
            `opts.range in t.number(defaultValue, opts) must have two elements. ${opts.range.length} given.`,
          )
        }
        if (!opts.range.every((n) => typeof n === 'number' && !isNaN(n))) {
          throw new Error(
            `opts.range in t.number(defaultValue, opts) must be a tuple of two numbers.`,
          )
        }
        if (opts.range[0] >= opts.range[1]) {
          throw new Error(
            `opts.range[0] in t.number(defaultValue, opts) must be smaller than opts.range[1]. Given: ${JSON.stringify(
              opts.range,
            )}`,
          )
        }
      }
      if (Object.prototype.hasOwnProperty.call(opts, 'nudgeMultiplier')) {
        if (
          typeof opts!.nudgeMultiplier !== 'number' ||
          !isFinite(opts!.nudgeMultiplier)
        ) {
          throw new Error(
            `opts.nudgeMultiplier in t.number(defaultValue, opts) must be a finite number. ${userReadableTypeOfValue(
              opts!.nudgeMultiplier,
            )} given.`,
          )
        }
      }
      if (Object.prototype.hasOwnProperty.call(opts, 'nudgeFn')) {
        if (typeof opts?.nudgeFn !== 'function') {
          throw new Error(
            `opts.nudgeFn in t.number(defaultValue, opts) must be a function. ${userReadableTypeOfValue(
              opts!.nudgeFn,
            )} given.`,
          )
        }
      }
    }
  }
  const sanitize = !opts?.sanitize
    ? _sanitizeNumber
    : (val: unknown): number | undefined => {
        const n = _sanitizeNumber(val)
        if (typeof n === 'number') {
          return opts.sanitize!(n)
        }
      }

  return {
    type: 'number',
    valueType: 0,
    default: defaultValue,
    [propTypeSymbol]: 'TheatrePropType',
    ...(opts ? opts : {}),
    label: opts?.label,
    nudgeFn: opts?.nudgeFn ?? defaultNumberNudgeFn,
    nudgeMultiplier:
      typeof opts?.nudgeMultiplier === 'number' ? opts.nudgeMultiplier : 1,
    isScalar: true,
    sanitize: sanitize,
    interpolate: opts?.interpolate ?? _interpolateNumber,
  }
}

const _sanitizeNumber = (value: unknown): undefined | number =>
  typeof value === 'number' && isFinite(value) ? value : undefined

const _interpolateNumber = (
  left: number,
  right: number,
  progression: number,
): number => {
  return left + progression * (right - left)
}

export const rgba = (
  defaultValue: Rgba,
  opts?: {
    label?: string
    sanitize?: Sanitizer<Rgba>
    interpolate?: Interpolator<Rgba>
  },
): PropTypeConfig_Rgba => {
  if (process.env.NODE_ENV !== 'production') {
    validateCommonOpts('t.rgba(defaultValue, opts)', opts)
    // FIXME: validate default value
  }

  return {
    type: 'rgba',
    valueType: null as $IntentionalAny,
    default: defaultValue,
    [propTypeSymbol]: 'TheatrePropType',
    label: opts?.label,
    sanitize: _sanitizeRgba,
    interpolate: opts?.interpolate ?? _interpolateRgba,
  }
}

// FIXME
// TODO: clamp components to allowed range
const _sanitizeRgba = (val: unknown): Rgba | undefined => {
  return val as Rgba
}

// FIXME: add gamma conversion
const _interpolateRgba = (
  left: Rgba,
  right: Rgba,
  progression: number,
): Rgba => {
  // TODO: Factor out all these utility functions
  function linearSrgbToSrgb(rgba: Rgba) {
    function compress(x: number) {
      // This looks funky because sRGB uses a linear scale below 0.0031308 in
      // order to avoid an infinite slope, while trying to approximate gamma 2.2
      // as closely as possible, hence the branching and the 2.4 exponent.
      if (x >= 0.0031308) return 1.055 * x ** (1.0 / 2.4) - 0.055
      else return 12.92 * x
    }
    return {
      r: compress(rgba.r),
      g: compress(rgba.g),
      b: compress(rgba.b),
      a: rgba.a,
    }
  }

  function srgbToLinearSrgb(rgba: Rgba) {
    function expand(x: number) {
      if (x >= 0.04045) return ((x + 0.055) / (1 + 0.055)) ** 2.4
      else return x / 12.92
    }
    return {
      r: expand(rgba.r),
      g: expand(rgba.g),
      b: expand(rgba.b),
      a: rgba.a,
    }
  }

  function linearSrgbToOklab(rgba: Rgba) {
    let l =
      0.4122214708 * rgba.r + 0.5363325363 * rgba.g + 0.0514459929 * rgba.b
    let m =
      0.2119034982 * rgba.r + 0.6806995451 * rgba.g + 0.1073969566 * rgba.b
    let s =
      0.0883024619 * rgba.r + 0.2817188376 * rgba.g + 0.6299787005 * rgba.b

    let l_ = Math.cbrt(l)
    let m_ = Math.cbrt(m)
    let s_ = Math.cbrt(s)

    return {
      L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
      a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
      b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
      alpha: rgba.a,
    }
  }

  function oklabToLinearSrgb(laba: Laba) {
    let l_ = laba.L + 0.3963377774 * laba.a + 0.2158037573 * laba.b
    let m_ = laba.L - 0.1055613458 * laba.a - 0.0638541728 * laba.b
    let s_ = laba.L - 0.0894841775 * laba.a - 1.291485548 * laba.b

    let l = l_ * l_ * l_
    let m = m_ * m_ * m_
    let s = s_ * s_ * s_

    return {
      r: +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
      a: laba.alpha,
    }
  }

  const leftLab = linearSrgbToOklab(srgbToLinearSrgb(left))
  const rightLab = linearSrgbToOklab(srgbToLinearSrgb(right))

  const interpolatedLab = {
    L: (1 - progression) * leftLab.L + progression * rightLab.L,
    a: (1 - progression) * leftLab.a + progression * rightLab.a,
    b: (1 - progression) * leftLab.b + progression * rightLab.b,
    alpha: (1 - progression) * leftLab.alpha + progression * rightLab.alpha,
  }

  const interpolatedRgba = linearSrgbToSrgb(oklabToLinearSrgb(interpolatedLab))

  return decorateRgba(interpolatedRgba)
}

/**
 * A boolean prop type
 *
 * @example
 * Usage:
 * ```ts
 * // shorthand:
 * const obj = sheet.object('key', {isOn: true})
 *
 * // with a label:
 * const obj = sheet.object('key', {
 *   isOn: t.boolean(true, {
 *     label: 'Enabled'
 *   })
 * })
 * ```
 *
 * @param defaultValue - The default value (must be a boolean)
 * @param opts - Options (See usage examples)
 */
export const boolean = (
  defaultValue: boolean,
  opts?: {
    label?: string
    sanitize?: Sanitizer<boolean>
    interpolate?: Interpolator<boolean>
  },
): PropTypeConfig_Boolean => {
  if (process.env.NODE_ENV !== 'production') {
    validateCommonOpts('t.boolean(defaultValue, opts)', opts)
    if (typeof defaultValue !== 'boolean') {
      throw new Error(
        `defaultValue in t.boolean(defaultValue) must be a boolean. ${userReadableTypeOfValue(
          defaultValue,
        )} given.`,
      )
    }
  }

  return {
    type: 'boolean',
    default: defaultValue,
    valueType: null as $IntentionalAny,
    [propTypeSymbol]: 'TheatrePropType',
    label: opts?.label,
    sanitize: _sanitizeBoolean,
    interpolate: leftInterpolate,
  }
}

const _sanitizeBoolean = (val: unknown): boolean | undefined => {
  return typeof val === 'boolean' ? val : undefined
}

function leftInterpolate<T>(left: T): T {
  return left
}

/**
 * A string prop type
 *
 * @example
 * Usage:
 * ```ts
 * // shorthand:
 * const obj = sheet.object('key', {message: "Animation loading"})
 *
 * // with a label:
 * const obj = sheet.object('key', {
 *   message: t.string("Animation Loading", {
 *     label: 'The Message'
 *   })
 * })
 * ```
 *
 * @param defaultValue - The default value (must be a string)
 * @param opts - The options (See usage examples)
 * @returns A string prop type
 */
export const string = (
  defaultValue: string,
  opts?: {
    label?: string
    sanitize?: Sanitizer<string>
    interpolate?: Interpolator<string>
  },
): PropTypeConfig_String => {
  if (process.env.NODE_ENV !== 'production') {
    validateCommonOpts('t.string(defaultValue, opts)', opts)
    if (typeof defaultValue !== 'string') {
      throw new Error(
        `defaultValue in t.string(defaultValue) must be a string. ${userReadableTypeOfValue(
          defaultValue,
        )} given.`,
      )
    }
  }
  return {
    type: 'string',
    default: defaultValue,
    valueType: null as $IntentionalAny,
    [propTypeSymbol]: 'TheatrePropType',
    label: opts?.label,
    sanitize(value: unknown) {
      if (opts?.sanitize) return opts.sanitize(value)
      return typeof value === 'string' ? value : undefined
    },
    interpolate: opts?.interpolate ?? leftInterpolate,
  }
}

/**
 * A stringLiteral prop type, useful for building menus or radio buttons.
 *
 * @example
 * Usage:
 * ```ts
 * // Basic usage
 * const obj = sheet.object('key', {
 *   light: t.stringLiteral("r", {r: "Red", "g": "Green"})
 * })
 *
 * // Shown as a radio switch with a custom label
 * const obj = sheet.object('key', {
 *   light: t.stringLiteral("r", {r: "Red", "g": "Green"})
 * }, {as: "switch", label: "Street Light"})
 * ```
 *
 * @returns A stringLiteral prop type
 *
 */
export function stringLiteral<Opts extends {[key in string]: string}>(
  /**
   * Default value (a string that equals one of the options)
   */
  defaultValue: Extract<keyof Opts, string>,
  /**
   * The options. Use the `"value": "Label"` format.
   *
   * An object like `{[value]: Label}`. Example: `{r: "Red", "g": "Green"}`
   */
  options: Opts,
  /**
   * opts.as Determines if editor is shown as a menu or a switch. Either 'menu' or 'switch'.  Default: 'menu'
   */
  opts?: {as?: 'menu' | 'switch'; label?: string},
): PropTypeConfig_StringLiteral<Extract<keyof Opts, string>> {
  return {
    type: 'stringLiteral',
    default: defaultValue,
    options: {...options},
    [propTypeSymbol]: 'TheatrePropType',
    valueType: null as $IntentionalAny,
    as: opts?.as ?? 'menu',
    label: opts?.label,
    sanitize(value: unknown) {
      if (typeof value !== 'string') return undefined
      if (Object.hasOwnProperty.call(options, value)) {
        return value as $IntentionalAny
      } else {
        return undefined
      }
    },
    interpolate: leftInterpolate,
  }
}

export type Sanitizer<T> = (value: unknown) => T | undefined
export type Interpolator<T> = (left: T, right: T, progression: number) => T

interface IBasePropType<ValueType, PropTypes = ValueType> {
  valueType: ValueType
  [propTypeSymbol]: 'TheatrePropType'
  label: string | undefined
  isScalar?: true
  sanitize?: Sanitizer<PropTypes>
  interpolate?: Interpolator<PropTypes>
  default: ValueType
}

export interface PropTypeConfig_Number extends IBasePropType<number> {
  type: 'number'
  default: number
  range?: [min: number, max: number]
  nudgeFn: NumberNudgeFn
  nudgeMultiplier: number
}

export type NumberNudgeFn = (p: {
  deltaX: number
  deltaFraction: number
  magnitude: number
  config: PropTypeConfig_Number
}) => number

const defaultNumberNudgeFn: NumberNudgeFn = ({
  config,
  deltaX,
  deltaFraction,
  magnitude,
}) => {
  const {range} = config
  if (range) {
    return (
      deltaFraction * (range[1] - range[0]) * magnitude * config.nudgeMultiplier
    )
  }

  return deltaX * magnitude * config.nudgeMultiplier
}

export interface PropTypeConfig_Boolean extends IBasePropType<boolean> {
  type: 'boolean'
  default: boolean
}

interface CommonOpts {
  label?: string
}

export interface PropTypeConfig_String extends IBasePropType<string> {
  type: 'string'
  default: string
}

export interface PropTypeConfig_StringLiteral<T extends string>
  extends IBasePropType<T> {
  type: 'stringLiteral'
  default: T
  options: Record<T, string>
  as: 'menu' | 'switch'
}

export interface PropTypeConfig_Rgba extends IBasePropType<Rgba> {
  type: 'rgba'
  default: Rgba
}

/**
 *
 */
export interface PropTypeConfig_Compound<
  Props extends IValidCompoundProps,
  PropTypes = Props,
> extends IBasePropType<
    {[K in keyof Props]: Props[K]['valueType']},
    PropTypes
  > {
  type: 'compound'
  props: Record<string, PropTypeConfig>
}

export interface PropTypeConfig_Enum extends IBasePropType<{}> {
  type: 'enum'
  cases: Record<string, PropTypeConfig>
  defaultCase: string
}

export type PropTypeConfig_AllPrimitives =
  | PropTypeConfig_Number
  | PropTypeConfig_Boolean
  | PropTypeConfig_String
  | PropTypeConfig_StringLiteral<$IntentionalAny>
  | PropTypeConfig_Rgba

export type PropTypeConfig =
  | PropTypeConfig_AllPrimitives
  | PropTypeConfig_Compound<$IntentionalAny>
  | PropTypeConfig_Enum
