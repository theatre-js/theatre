import {BackMemoryAdapter, SaazBack} from '@theatre/saaz'
import {schema} from 'src/state/schema'

const backs: {[key in string]?: SaazBack} = {}

export function getSaazBack(dbName: string): SaazBack {
  if (!backs[dbName]) {
    backs[dbName] = new SaazBack({
      dbName,
      schema,
      storageAdapter: new BackMemoryAdapter(),
    })
  }
  return backs[dbName]!
}
