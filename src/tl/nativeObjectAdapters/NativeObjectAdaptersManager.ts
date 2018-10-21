import Project from '$tl/Project/Project'
import {range} from '$shared/utils'
import {keyBy, mapValues} from '$shared/utils'
// import {NativeObjectTypeConfig} from '../objects/objectTypes'
import {NativeObjectTypeConfig, NativeObjectType} from '$tl/objects/objectTypes'
import {VoidFn} from '$shared/types'
import TimelineInstanceObject from '$tl/objects/TimelineInstanceObject'
import userReadableTypeOfValue from '$shared/utils/userReadableTypeOfValue'

export interface NativeObjectAdapter {
  name: string
  accepts(nativeObject: $FixMe): boolean
  getType(
    nativeObject: $FixMe,
    config?: NativeObjectTypeConfig,
  ): NativeObjectType
  start?(
    object: TimelineInstanceObject,
    nativeObject: $FixMe,
    config?: NativeObjectTypeConfig,
  ): VoidFn
}

type Priority = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

const adaptersRange = range(1, 11)

export default class NativeObjectAdapters {
  _adaptersByPriority: {
    [priority: number]: Set<NativeObjectAdapter>
  } = mapValues(keyBy(adaptersRange, v => v), () => new Set())

  constructor(readonly project: Project) {}

  add(adapter: NativeObjectAdapter, priority: Priority = 5) {
    const adapters = this._adaptersByPriority[priority]
    if (!adapters) {
      throw new Error(
        `The priority argument to adapters.add(${priority}, ...) must be an interger between 1 and 10`,
      )
    }

    adapters.add(adapter)
  }

  findAdapterForNativeObject(
    nativeObject: $FixMe,
    // nativeObjectConfig: NativeObjectTypeConfig,
  ): void | NativeObjectAdapter {
    for (const priority of adaptersRange) {
      const adapters = this._adaptersByPriority[priority]
      for (const adapter of adapters) {
        const result = adapter.accepts(nativeObject)
        if (typeof result === 'boolean') {
          if (result === true) return adapter
        } else {
          if (!$env.tl.isCore) {
            console.group(
              `I just tried to call the accept() method on "${
                adapter.name
              }". Instead of returning true or false, it returned ${userReadableTypeOfValue(
                result,
              )}. To fix this, make sure the accept() method either returns true or false. Learn more about adapters at https://theatrejs.com/docs/adapters.html`,
            )
            console.log(`Value supplied to the adapter:`, nativeObject)
            console.groupEnd()
          }
        }
      }
    }
  }
}
