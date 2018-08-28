import isPlainObject from 'lodash/isPlainObject'
import {default as box, BoxAtom} from './boxAtom'
import {default as dict, DictAtom} from './dictAtom'
import {default as array, ArrayAtom} from './arrayAtom'
import mapValues from 'lodash/mapValues'
import {default as AbstractAtom} from './utils/AbstractAtom'

export type Atomify<V> = {
  '1': V extends Array<infer T>
    ? ArrayAtom<Atomify<T>>
    : V extends AbstractAtom<$IntentionalAny>
      ? V
      : // following is commented out as I don't know how to detect plain objects in TS
        // V extends {constructor: Function} ? BoxAtom<V> :
        V extends Function
        ? BoxAtom<V>
        : V extends object
          ? DictAtom<{[K in keyof V]: Atomify<V[K]>}>
          : BoxAtom<V>
}[V extends number ? '1' : '1']

const atomifyDeep = <V extends {}>(jsValue: V): Atomify<V> => {
  if (Array.isArray(jsValue)) {
    return fromJSArray(jsValue)
  } else if (isPlainObject(jsValue)) {
    return fromJSObject(jsValue as $IntentionalAny)
  } else if (jsValue instanceof AbstractAtom) {
    return jsValue as $IntentionalAny
  } else {
    return fromJSPrimitive(jsValue)
  }
}

const fromJSArray = (jsArray: $IntentionalAny): $IntentionalAny => {
  return array(jsArray.map(atomifyDeep))
}

const fromJSObject = (jsObject: {[key: string]: mixed}): $IntentionalAny => {
  return dict(mapValues(jsObject, atomifyDeep))
}

const fromJSPrimitive = (jsPrimitive: mixed): $IntentionalAny => {
  return box(jsPrimitive)
}

export default atomifyDeep
