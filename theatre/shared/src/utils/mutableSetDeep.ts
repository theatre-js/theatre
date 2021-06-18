import type {Pointer} from '@theatre/dataverse'
import {getPointerParts, pointer} from '@theatre/dataverse'
import lodashSet from 'lodash-es/set'

export default function mutableSetDeep<O extends {}, T>(
  obj: O,
  getPath: (p: Pointer<O>) => Pointer<T>,
  val: T,
) {
  const path = getPointerParts(getPath(pointer<O>({root: {}, path: []}))).path
  lodashSet(obj, path, val)
}
