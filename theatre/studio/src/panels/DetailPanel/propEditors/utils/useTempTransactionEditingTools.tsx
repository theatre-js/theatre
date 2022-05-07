import getStudio from '@theatre/studio/getStudio'
import type {SerializableValue} from '@theatre/shared/utils/types'
import type {
  CommitOrDiscard,
  ITransactionPrivateApi,
} from '@theatre/studio/StudioStore/StudioStore'
import type {IEditingTools} from './IEditingTools'
import {useMemo} from 'react'

export function useTempTransactionEditingTools<T extends SerializableValue>(
  writeTx: (api: ITransactionPrivateApi, value: T) => void,
): IEditingTools<T> {
  return useMemo(() => createEditingTool<T>(writeTx), [])
}

function createEditingTool<T>(
  writeTx: (api: ITransactionPrivateApi, value: T) => void,
) {
  let currentTransaction: CommitOrDiscard | null = null
  const createTempTx = (value: T) =>
    getStudio().tempTransaction((api) => writeTx(api, value))

  function discardTemporaryValue() {
    if (currentTransaction) {
      currentTransaction.discard()
      currentTransaction = null
    }
  }

  return {
    temporarilySetValue(value: T): void {
      discardTemporaryValue()
      currentTransaction = createTempTx(value)
    },
    discardTemporaryValue,
    permanentlySetValue(value: T): void {
      discardTemporaryValue()
      createTempTx(value).commit()
    },
  }
}
