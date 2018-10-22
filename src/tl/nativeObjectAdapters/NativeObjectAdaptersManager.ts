import Project from '$tl/Project/Project'
import {range} from '$shared/utils'
import {keyBy, mapValues} from '$shared/utils'
import {NativeObjectTypeConfig, NativeObjectType} from '$tl/objects/objectTypes'
import {VoidFn} from '$shared/types'
import userReadableTypeOfValue from '$shared/utils/userReadableTypeOfValue'
import TheatreJSAdaptersManager from '$tl/facades/TheatreJSAdaptersManager'
import TheatreJSTimelineInstanceObject from '$tl/facades/TheatreJSTimelineInstanceObject'

export interface NativeObjectAdapter {
  name: string
  canHandle(nativeObject: $FixMe): boolean
  getType(
    nativeObject: $FixMe,
    config: NativeObjectTypeConfig,
  ): NativeObjectType
  start(object: TheatreJSTimelineInstanceObject): VoidFn
}

export type AdapterPriority = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

const adaptersRange = range(1, 11)

export default class NativeObjectAdapters {
  _adaptersByPriority: {
    [priority: number]: Set<NativeObjectAdapter>
  } = mapValues(keyBy(adaptersRange, v => v), () => new Set())
  _adaptersByName = new Map<string, NativeObjectAdapter>()
  facade: TheatreJSAdaptersManager

  constructor(readonly project: Project) {
    this.facade = new TheatreJSAdaptersManager(this)
  }

  add(adapter: NativeObjectAdapter, priority: AdapterPriority = 5) {
    this._adaptersByPriority[priority].add(adapter)
    this._adaptersByName.set(adapter.name, adapter)
  }

  getAdapterByName(name: string) {
    return this._adaptersByName.get(name)
  }

  findAdapterForNativeObject(
    nativeObject: $FixMe,
    // nativeObjectConfig: NativeObjectTypeConfig,
  ): void | NativeObjectAdapter {
    for (const priority of adaptersRange) {
      const adapters = this._adaptersByPriority[priority]
      for (const adapter of adapters) {
        const result = adapter.canHandle(nativeObject)
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
