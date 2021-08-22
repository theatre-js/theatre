import type {$IntentionalAny} from '@theatre/shared/utils/types'

const s = Symbol('TheatrePropType_Basic')
type S = typeof s

interface IBasePropType<ValueType> {
  valueType: ValueType
  [s]: 'TheatrePropType'
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

export interface PropTypeConfig_Boolean extends IBasePropType<boolean> {
  type: 'boolean'
  default: boolean
}

export type PropTypeConfigExtras = {
  label?: string
}

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

export interface PropTypeConfig_String extends IBasePropType<string> {
  type: 'string'
  default: string
}

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

export interface PropTypeConfig_StringLiteral<T extends string>
  extends IBasePropType<T> {
  type: 'stringLiteral'
  default: T
  options: Record<T, string>
  as: 'menu' | 'switch'
}

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

type IValidCompoundProps = {
  [K in string]: PropTypeConfig
}

/**
 * @todo Determine if 'compound' is a clear term for what this is.
 * I didn't want to use 'object' as it could get confused with
 * SheetObject.
 */
export interface PropTypeConfig_Compound<Props extends IValidCompoundProps>
  extends IBasePropType<{[K in keyof Props]: Props[K]['valueType']}> {
  type: 'compound'
  props: Record<string, PropTypeConfig>
}

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

export interface PropTypeConfig_CSSRGBA
  extends IBasePropType<{r: number; g: number; b: number; a: number}> {
  type: 'cssrgba'
  default: {r: number; g: number; b: number; a: number}
}

export const rgba = (
  defaultValue: {r: number; b: number; g: number; a: number},
  extras?: PropTypeConfigExtras,
): PropTypeConfig_CSSRGBA => {
  return {
    type: 'cssrgba',
    valueType: null as $IntentionalAny,
    [s]: 'TheatrePropType',
    label: extras?.label,
    default: defaultValue,
  }
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
  | PropTypeConfig_CSSRGBA

export type PropTypeConfig =
  | PropTypeConfig_AllPrimitives
  | PropTypeConfig_Compound<$IntentionalAny>
  | PropTypeConfig_Enum
