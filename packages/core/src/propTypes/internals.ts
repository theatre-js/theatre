import {InvalidArgumentError} from '@theatre/utils/errors'
import type {$IntentionalAny} from '@theatre/core/types/public'
import userReadableTypeOfValue from '@theatre/utils/userReadableTypeOfValue'
import {isPlainObject} from 'lodash-es'
import {
  propTypeSymbol,
  type PropTypeConfig,
  type UnknownShorthandCompoundProps,
  type UnknownValidCompoundProps,
} from '@theatre/core/types/public'
import * as t from './index'

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
