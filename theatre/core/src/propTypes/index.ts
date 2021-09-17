import type {$IntentionalAny} from '@theatre/shared/utils/types'
import userReadableTypeOfValue from '@theatre/shared/utils/userReadableTypeOfValue'
import type {
  IShorthandCompoundProps,
  IValidCompoundProps,
  ShorthandCompoundPropsToLonghandCompoundProps,
} from './internals'
import {sanitizeCompoundProps} from './internals'
import {propTypeSymbol} from './internals'

const validateCommonOpts = (
  fnCallSignature: string,
  opts?: PropTypeConfigOpts,
) => {
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
 * @param props
 * @param opts
 * @returns
 *
 */
export const compound = <Props extends IShorthandCompoundProps>(
  props: Props,
  opts?: PropTypeConfigOpts,
): PropTypeConfig_Compound<
  ShorthandCompoundPropsToLonghandCompoundProps<Props>
> => {
  validateCommonOpts('t.compound(props, opts)', opts)
  return {
    type: 'compound',
    props: sanitizeCompoundProps(props),
    valueType: null as $IntentionalAny,
    [propTypeSymbol]: 'TheatrePropType',
    label: opts?.label,
  }
}

/**
 * A number prop type.
 *
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
 * @param defaultValue The default value (Must be a finite number)
 * @param opts The options (See usage examples)
 * @returns A number prop config
 */
export const number = (
  defaultValue: number,
  opts?: {
    nudgeFn?: PropTypeConfig_Number['nudgeFn']
    range?: PropTypeConfig_Number['range']
    nudgeMultiplier?: number
  } & PropTypeConfigOpts,
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
        if (!opts.range.every((n) => typeof n === 'number' && isFinite(n))) {
          throw new Error(
            `opts.range in t.number(defaultValue, opts) must be a tuple of two finite numbers.`,
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
  }
}

/**
 * A boolean prop type
 *
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
 * @param defaultValue The default value (must be a boolean)
 * @param opts Options (See usage examples)
 */
export const boolean = (
  defaultValue: boolean,
  opts?: PropTypeConfigOpts,
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
  }
}

/**
 * A string prop type
 *
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
 * @param defaultValue The default value (must be a string)
 * @param opts The options (See usage examples)
 * @returns A string prop type
 */
export const string = (
  defaultValue: string,
  opts?: PropTypeConfigOpts,
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
  }
}

/**
 * A stringLiteral prop type, useful for building menus or radio buttons.
 *
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
 * @param defaultValue A string
 * @param options An object like `{[value]: Label}`. Example: {r: "Red", "g": "Green"}
 * @param opts Extra opts
 * @param opts.as Determines if editor is shown as a menu or a switch. Either 'menu' or 'switch'.  Default: 'menu'
 * @returns A stringLiteral prop type
 *
 */
export function stringLiteral<Opts extends {[key in string]: string}>(
  defaultValue: Extract<keyof Opts, string>,
  options: Opts,
  opts?: {as?: 'menu' | 'switch'} & PropTypeConfigOpts,
): PropTypeConfig_StringLiteral<Extract<keyof Opts, string>> {
  return {
    type: 'stringLiteral',
    default: defaultValue,
    options: {...options},
    [propTypeSymbol]: 'TheatrePropType',
    valueType: null as $IntentionalAny,
    as: opts?.as ?? 'menu',
    label: opts?.label,
  }
}

interface IBasePropType<ValueType> {
  valueType: ValueType
  [propTypeSymbol]: 'TheatrePropType'
  label: string | undefined
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

export interface PropTypeConfigOpts {
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

/**
 *
 */
export interface PropTypeConfig_Compound<Props extends IValidCompoundProps>
  extends IBasePropType<{[K in keyof Props]: Props[K]['valueType']}> {
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

export type PropTypeConfig =
  | PropTypeConfig_AllPrimitives
  | PropTypeConfig_Compound<$IntentionalAny>
  | PropTypeConfig_Enum
