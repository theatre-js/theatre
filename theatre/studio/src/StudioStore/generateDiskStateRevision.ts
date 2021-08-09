import {nanoid} from 'nanoid'

export function generateDiskStateRevision() {
  return nanoid(16)
}
