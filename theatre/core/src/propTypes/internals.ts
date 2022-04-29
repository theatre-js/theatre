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

export type UnknownValidCompoundProps = {
  [K in string]: PropTypeConfig
}

/**
 *
 * This does not include Rgba since Rgba does not have a predictable
 * object shape. We prefer to infer that compound props are described as
 * `Record<string, IShorthandProp>` for now.
 *
 * In the future, it might be reasonable to wrap these types up into something
 * which would allow us to differentiate between values at runtime
 * (e.g. `val.type = "Rgba"` vs `val.type = "Compound"` etc)
 */
type UnknownShorthandProp =
  | string
  | number
  | boolean
  | PropTypeConfig
  | UnknownShorthandCompoundProps

/** Given an object like this, we have enough info to predict the compound prop */
export type UnknownShorthandCompoundProps = {
  [K in string]: UnknownShorthandProp
}

export type ShorthandPropToLonghandProp<P extends UnknownShorthandProp> =
  P extends string
    ? PropTypeConfig_String
    : P extends number
    ? PropTypeConfig_Number
    : P extends boolean
    ? PropTypeConfig_Boolean
    : P extends PropTypeConfig
    ? P
    : P extends UnknownShorthandCompoundProps
    ? PropTypeConfig_Compound<ShorthandCompoundPropsToLonghandCompoundProps<P>>
    : never

export type ShorthandCompoundPropsToInitialValue<
  P extends UnknownShorthandCompoundProps,
> = LonghandCompoundPropsToInitialValue<
  ShorthandCompoundPropsToLonghandCompoundProps<P>
>

type LonghandCompoundPropsToInitialValue<P extends UnknownValidCompoundProps> =
  {
    [K in keyof P]: P[K]['valueType']
  }

export type PropsValue<P> = P extends UnknownValidCompoundProps
  ? LonghandCompoundPropsToInitialValue<P>
  : P extends UnknownShorthandCompoundProps
  ? LonghandCompoundPropsToInitialValue<
      ShorthandCompoundPropsToLonghandCompoundProps<P>
    >
  : never

export type ShorthandCompoundPropsToLonghandCompoundProps<
  P extends UnknownShorthandCompoundProps,
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
  props: UnknownShorthandCompoundProps,
): UnknownValidCompoundProps {
  const sanitizedProps: UnknownValidCompoundProps = {}
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
