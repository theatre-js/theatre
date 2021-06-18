import {nanoid as generateNonSecure} from 'nanoid/non-secure'
import type {$IntentionalAny, Nominal} from './types'

export type KeyframeId = Nominal<string, 'KeyframeId'>

export function generateKeyframeId() {
  return generateNonSecure(10) as KeyframeId
}

export function asKeyframeId(s: string): KeyframeId {
  return s as $IntentionalAny
}

// @todo make nominal
export type SequenceTrackId = string

export function generateSequenceTrackId() {
  return generateNonSecure(10) as $IntentionalAny as SequenceTrackId
}

export function asSequenceTrackId(s: string): SequenceTrackId {
  return s as $IntentionalAny
}
