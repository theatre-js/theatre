// @flow
import isPlainObject from 'lodash/isPlainObject'
type Atom = $FlowFixMe

export const fromJS = (jsValue: mixed): Atom => {
  if (Array.isArray(jsValue)) {
    return fromJSArray(jsValue)
  } else if (isPlainObject(jsValue)) {
    return fromJSObject((jsValue: $IntentionalAny))
  } else {
    return fromJSPrimitive(jsValue)
  }
}

export const fromJSArray = (jsArray: Array<mixed>): Atom => {

}

export const fromJSObject = (jsObject: {[key: mixed]: mixed}): Atom => {

}

export const fromJSPrimitive = (jsPrimitive: mixed): Atom => {

}

export default fromJS