import produce from 'immer'
import type {$IntentionalAny, Schema} from '../types'

export function ensureStateIsUptodate<S extends {$schemaVersion: number}>(
  original: $IntentionalAny,
  schema: Schema<S>,
): S {
  if (
    !original ||
    typeof original.version !== 'number' ||
    original.version < schema.version
  ) {
    return produce((original ?? {}) as {}, (originalDraft) => {
      schema.migrate(originalDraft)
    }) as S
  } else {
    return original
  }
}
