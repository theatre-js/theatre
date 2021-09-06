import {InvalidArgumentError} from '@theatre/shared/utils/errors'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import userReadableTypeOfValue from '@theatre/shared/utils/userReadableTypeOfValue'
import {isPlainObject} from 'lodash-es'
import type {
  PropTypeConfig,
  PropTypeConfig_Boolean,
  PropTypeConfig_Compound,
  PropTypeConfig_Number,
  PropTypeConfig_String,
} from './index'
import * as t from './index'

export const propTypeSymbol = Symbol('TheatrePropType_Basic')

export type IValidCompoundProps = {
  [K in string]: PropTypeConfig
}

type IShorthandProp =
  | string
  | number
  | boolean
  | PropTypeConfig
  | IShorthandCompoundProps

export type IShorthandCompoundProps = {
  [K in string]: IShorthandProp
}

type ShorthandPropToLonghandProp<P extends IShorthandProp> = P extends string
  ? PropTypeConfig_String
  : P extends number
  ? PropTypeConfig_Number
  : P extends boolean
  ? PropTypeConfig_Boolean
  : P extends PropTypeConfig
  ? P
  : P extends IShorthandCompoundProps
  ? PropTypeConfig_Compound<ShorthandCompoundPropsToLonghandCompoundProps<P>>
  : never

export type ShorthandCompoundPropsToLonghandCompoundProps<
  P extends IShorthandCompoundProps,
> = {
  [K in keyof P]: ShorthandPropToLonghandProp<P[K]>
}

export function isLonghandPropType(t: unknown): t is PropTypeConfig {
  return (
    typeof t === 'object' &&
    !!t &&
    (t as $IntentionalAny)[propTypeSymbol] === 'TheatrePropType'
  )
}

export function toLonghandProp(p: unknown): PropTypeConfig {
  if (typeof p === 'number') {
    return t.number(p)
  } else if (typeof p === 'boolean') {
    return t.boolean(p)
  } else if (typeof p === 'string') {
    return t.string(p)
  } else if (typeof p === 'object' && !!p) {
    if (isLonghandPropType(p)) return p
    if (isPlainObject(p)) {
      return t.compound(p as $IntentionalAny)
    } else {
      throw new InvalidArgumentError(
        `This value is not a valid prop type: ${userReadableTypeOfValue(p)}`,
      )
    }
  } else {
    throw new InvalidArgumentError(
      `This value is not a valid prop type: ${userReadableTypeOfValue(p)}`,
    )
  }
}

export function sanitizeCompoundProps(
  props: IShorthandCompoundProps,
): IValidCompoundProps {
  const sanitizedProps: IValidCompoundProps = {}
  if (process.env.NODE_ENV !== 'production') {
    if (typeof props !== 'object' || !props) {
      throw new InvalidArgumentError(
        `t.compound() expects an object, like: {x: 10}. ${userReadableTypeOfValue(
          props,
        )} given.`,
      )
    }
  }
  for (const key of Object.keys(props)) {
    if (process.env.NODE_ENV !== 'production') {
      if (typeof key !== 'string') {
        throw new InvalidArgumentError(
          `t.compound()'s keys must be all strings. ${userReadableTypeOfValue(
            key,
          )} given.`,
        )
      } else if (key.length === 0 || !key.match(/^\w+$/)) {
        throw new InvalidArgumentError(
          `compound key ${userReadableTypeOfValue(
            key,
          )} is invalid. The keys must be alphanumeric and start with a letter.`,
        )
      } else if (key.length > 64) {
        throw new InvalidArgumentError(
          `compound key ${userReadableTypeOfValue(key)} is too long.`,
        )
      }
    }

    const val = props[key]
    if (isLonghandPropType(val)) {
      sanitizedProps[key] = val as $IntentionalAny
    } else {
      sanitizedProps[key] = toLonghandProp(val) as $IntentionalAny
    }
  }
  return sanitizedProps
}
