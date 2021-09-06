import {InvalidArgumentError} from '@theatre/shared/utils/errors'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import userReadableTypeOfValue from '@theatre/shared/utils/userReadableTypeOfValue'
import {isPlainObject} from 'lodash-es'
import type {PropTypeConfig} from './index'
import * as t from './index'

export const propTypeSymbol = Symbol('TheatrePropType_Basic')

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
