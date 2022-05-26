import {editorStore} from './store'
import type {ISheet} from '@theatre/core'

export const refreshSnapshot = editorStore.getState().createSnapshot

export const makeStoreKey = (sheet: ISheet, name: string) =>
  `${sheet.address.sheetId}:${sheet.address.sheetInstanceId}:${name}`
