import type SheetObject from '@theatre/core/sheetObjects/SheetObject'

export function getObjectNamespacePath(object: SheetObject): string[] {
  let existing = OBJECT_SPLITS_MEMO.get(object)
  if (!existing) {
    existing = object.address.objectKey.split(
      RE_SPLIT_BY_SLASH_WITHOUT_WHITESPACE,
    )
    console.assert(existing.length > 0, 'expected not empty')
    OBJECT_SPLITS_MEMO.set(object, existing)
  }
  return existing
}
/**
 * Relying on the fact we try to "sanitize paths" earlier.
 * Go look for `sanifySlashedPath` in a `utils/slashedPaths.ts`.
 */
const RE_SPLIT_BY_SLASH_WITHOUT_WHITESPACE = /\s*\/\s*/g
const OBJECT_SPLITS_MEMO = new WeakMap<SheetObject, string[]>()
