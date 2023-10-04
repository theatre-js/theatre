import type {$IntentionalAny, FullSnapshot, Schema} from '../types'

const empty = {op: {}, cell: {}}

export function ensureStateIsUptodate<S extends {$schemaVersion: number}>(
  original: FullSnapshot<S> | null,
  schema: Schema<S>,
): FullSnapshot<S> {
  if (original === null) {
    return empty as $IntentionalAny
  }
  return original as $IntentionalAny

  // if (
  //   !original ||
  //   typeof original.op.$schemaVersion !== 'number' ||
  //   original.op.$schemaVersion < schema.version
  // ) {
  //   return {
  //     op: produce((original?.op ?? {}) as {}, (originalDraft) => {
  //       schema.migrateOp(originalDraft)
  //     }) as S,
  //     cell: original?.cell ?? {},
  //   }
  // } else {
  //   return original
  // }
}
