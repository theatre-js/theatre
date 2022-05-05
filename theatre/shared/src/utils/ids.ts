import {nanoid as generateNonSecure} from 'nanoid/non-secure'
import type {Nominal} from './Nominal'

export type KeyframeId = Nominal<'KeyframeId'>

export function generateKeyframeId(): KeyframeId {
  return generateNonSecure(10) as KeyframeId
}

export function asKeyframeId(s: string): KeyframeId {
  return s as KeyframeId
}

export type ProjectId = Nominal<'ProjectId'>
export type SheetId = Nominal<'SheetId'>
export type SheetInstanceId = Nominal<'SheetInstanceId'>
export type PaneInstanceId = Nominal<'PaneInstanceId'>
export type SequenceTrackId = Nominal<'SequenceTrackId'>
export type SequenceMarkerId = Nominal<'SequenceMarkerId'>
export type ObjectAddressKey = Nominal<'ObjectAddressKey'>
/** UI panels can contain a {@link PaneInstanceId} or something else. */
export type UIPanelId = Nominal<'UIPanelId'>

export function generateSequenceTrackId(): SequenceTrackId {
  return generateNonSecure(10) as SequenceTrackId
}

export function asSequenceTrackId(s: string): SequenceTrackId {
  return s as SequenceTrackId
}

export function generateSequenceMarkerId(): SequenceMarkerId {
  return generateNonSecure(10) as SequenceMarkerId
}
