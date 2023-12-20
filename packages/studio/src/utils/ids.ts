import {nanoid as generateNonSecure} from 'nanoid/non-secure'
import type {SequenceMarkerId} from '@theatre/core/types/public'

export function generateSequenceMarkerId(): SequenceMarkerId {
  return generateNonSecure(10) as SequenceMarkerId
}
