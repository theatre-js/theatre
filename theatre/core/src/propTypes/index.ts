/**
 * Usage:
 * ```ts
 * import {types as t} from '@theatre/core'
 *
 * const props = t.compound({
 *   x: t.number(0),
 *   y: t.number(0)
 * })
 *
 *
 * const obj = sheet.obj("An object", props)
 * ```
 * @module types
 */
import type {$IntentionalAny} from '@theatre/shared/utils/types'

const s = Symbol('TheatrePropType_Basic')

/**
 * Creates a compound prop type (basically a JS object).
 * Usage:
 * ```ts
 * // the root prop type of an object is always a compound
 * const props = t.compound({
 *   // compounds can be nested
 *   position: t.compound({
 *     x: t.number(0),
 *     y: t.number(0)
 *   })
 * })
 *
 * const obj = sheet.obj('key', props)
 * console.log(obj.value) // {position: {x: 10.3, y: -1}}
 * ```
 * @param props
 * @param extras
 * @returns
 *
 * @category Prop type definitions
 */
export const compound = <Props extends IValidCompoundProps>(
  props: Props,
  extras?: PropTypeConfigExtras,
): PropTypeConfig_Compound<Props> => {
  return {
    type: 'compound',
    props,
    valueType: null as $IntentionalAny,
    [s]: 'TheatrePropType',
    label: extras?.label,
  }
}

/**
 *
 * @param defaultValue
 * @param opts
 * @returns
 *
 * @category Prop type definitions
 */
export const number = (
  defaultValue: number,
  opts?: {
    nudgeFn?: PropTypeConfig_Number['nudgeFn']
    range?: PropTypeConfig_Number['range']
    nudgeMultiplier?: number
  } & PropTypeConfigExtras,
): PropTypeConfig_Number => {
  return {
    type: 'number',
    valueType: 0,
    default: defaultValue,
    [s]: 'TheatrePropType',
    ...(opts ? opts : {}),
    label: opts?.label,
    nudgeFn: opts?.nudgeFn ?? defaultNumberNudgeFn,
    nudgeMultiplier:
      typeof opts?.nudgeMultiplier === 'number' ? opts.nudgeMultiplier : 1,
  }
}

/**
 *
 * @param defaultValue
 * @param extras
 * @returns
 *
 * @category Prop type definitions
 */
export const boolean = (
  defaultValue: boolean,
  extras?: PropTypeConfigExtras,
): PropTypeConfig_Boolean => {
  return {
    type: 'boolean',
    default: defaultValue,
    valueType: null as $IntentionalAny,
    [s]: 'TheatrePropType',
    label: extras?.label,
  }
}

/**
 *
 * @param defaultValue
 * @param extras
 * @returns
 *
 * @category Prop type definitions
 */
export const string = (
  defaultValue: string,
  extras: PropTypeConfigExtras,
): PropTypeConfig_String => {
  return {
    type: 'string',
    default: defaultValue,
    valueType: null as $IntentionalAny,
    [s]: 'TheatrePropType',
    label: extras.label,
  }
}

/**
 *
 * @param defaultValue
 * @param options
 * @param extras
 * @returns
 *
 * @category Prop type definitions
 */
export function stringLiteral<Opts extends {[key in string]: string}>(
  defaultValue: Extract<keyof Opts, string>,
  options: Opts,
  extras?: {as?: 'menu' | 'switch'} & PropTypeConfigExtras,
): PropTypeConfig_StringLiteral<Extract<keyof Opts, string>> {
  return {
    type: 'stringLiteral',
    default: defaultValue,
    options: {...options},
    [s]: 'TheatrePropType',
    valueType: null as $IntentionalAny,
    as: extras?.as ?? 'menu',
    label: extras?.label,
  }
}

// export const rgba = (
//   defaultValue: {r: number; b: number; g: number; a: number},
//   extras?: PropTypeConfigExtras,
// ): PropTypeConfig_CSSRGBA => {
//   return {
//     type: 'cssrgba',
//     valueType: null as $IntentionalAny,
//     [s]: 'TheatrePropType',
//     label: extras?.label,
//     default: defaultValue,
//   }
// }

interface IBasePropType<ValueType> {
  valueType: ValueType
  /**
   * @internal
   */
  [s]: 'TheatrePropType'
  label: string | undefined
}

/**
 * @internal
 */
export interface PropTypeConfig_Number extends IBasePropType<number> {
  type: 'number'
  default: number
  range?: [min: number, max: number]
  nudgeFn: NumberNudgeFn
  nudgeMultiplier: number
}
/**
 * @internal
 */
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
/**
 * @internal
 */
export interface PropTypeConfig_Boolean extends IBasePropType<boolean> {
  type: 'boolean'
  default: boolean
}
/**
 * @internal
 */
export interface PropTypeConfigExtras {
  label?: string
}
/**
 * @internal
 */ export interface PropTypeConfig_String extends IBasePropType<string> {
  type: 'string'
  default: string
}

/**
 * @internal
 */
export interface PropTypeConfig_StringLiteral<T extends string>
  extends IBasePropType<T> {
  type: 'stringLiteral'
  default: T
  options: Record<T, string>
  as: 'menu' | 'switch'
}

type IValidCompoundProps = {
  [K in string]: PropTypeConfig
}

/**
 * @todo Determine if 'compound' is a clear term for what this is.
 * I didn't want to use 'object' as it could get confused with
 * SheetObject.
 *
 * @internal
 */
export interface PropTypeConfig_Compound<Props extends IValidCompoundProps>
  extends IBasePropType<{[K in keyof Props]: Props[K]['valueType']}> {
  type: 'compound'
  props: Record<string, PropTypeConfig>
}

// export interface PropTypeConfig_CSSRGBA
//   extends IBasePropType<{r: number; g: number; b: number; a: number}> {
//   type: 'cssrgba'
//   default: {r: number; g: number; b: number; a: number}
// }
/**
 * @internal
 */
export interface PropTypeConfig_Enum extends IBasePropType<{}> {
  type: 'enum'
  cases: Record<string, PropTypeConfig>
  defaultCase: string
}
/**
 * @category Prop type definitions
 */
export type PropTypeConfig_AllPrimitives =
  | PropTypeConfig_Number
  | PropTypeConfig_Boolean
  | PropTypeConfig_String
  | PropTypeConfig_StringLiteral<$IntentionalAny>
// | PropTypeConfig_CSSRGBA
/**
 * @internal
 */
export type PropTypeConfig =
  | PropTypeConfig_AllPrimitives
  | PropTypeConfig_Compound<$IntentionalAny>
  | PropTypeConfig_Enum
