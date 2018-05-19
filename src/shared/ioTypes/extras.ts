import * as t from './index'
import React from 'react'

function isNativeClass(value: $IntentionalAny): boolean {
  return typeof value === 'function' && value.toString().indexOf('class') === 0
}

export const $IReactComponent = t.$IntentionalAny
  .castStatic<React.ComponentType>()
  .refinement(v => {
    if (typeof v !== 'function') return false
    if (isNativeClass(v)) {
      return v.prototype instanceof React.Component || v === React.Component
    }

    return true
  }, 'ReactComponent')
