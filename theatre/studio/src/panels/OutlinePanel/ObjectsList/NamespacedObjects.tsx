import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import {getObjectNamespacePath} from './getObjectNamespacePath'

/** See {@link addToNamespace} for adding to the namespace, easily. */
export type NamespacedObjects = Map<
  string,
  {
    object?: SheetObject
    nested?: NamespacedObjects
  }
>

export function addToNamespace(
  mutObjects: NamespacedObjects,
  object: SheetObject,
) {
  _addToNamespace(mutObjects, getObjectNamespacePath(object), object)
}
function _addToNamespace(
  mutObjects: NamespacedObjects,
  path: string[],
  object: SheetObject,
) {
  console.assert(path.length > 0, 'expecting path to not be empty')
  const [next, ...rest] = path
  let existing = mutObjects.get(next)
  if (!existing) {
    existing = {
      nested: undefined,
      object: undefined,
    }
    mutObjects.set(next, existing)
  }

  if (rest.length === 0) {
    console.assert(
      !existing.object,
      'expect not to have existing object with same name',
      {existing, object},
    )
    existing.object = object
  } else {
    if (!existing.nested) {
      existing.nested = new Map()
    }

    _addToNamespace(existing.nested, rest, object)
  }
}
