import Project from '$tl/Project/Project'
import range from 'lodash/range'
import {keyBy, mapValues} from 'lodash'
// import {NativeObjectTypeConfig} from '../objects/objectTypes'
import htmlElementAdapter from './htmlElementAdapter/htmlElementAdapter'
import {NativeObjectTypeConfig, NativeObjectType} from '$tl/objects/objectTypes'
import {VoidFn} from '$shared/types'
import TimelineInstanceObject from '$tl/objects/TimelineInstanceObject'

export interface NativeObjectAdapter {
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

  constructor(readonly project: Project) {
    this.add(5, htmlElementAdapter)
  }

  add(priority: Priority, adapter: NativeObjectAdapter) {
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
        if (adapter.accepts(nativeObject)) return adapter
      }
    }
  }
}
