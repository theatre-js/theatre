import {NativeObjectAdapter} from '$tl/nativeObjectAdapters/NativeObjectAdaptersManager'
import {NativeObjectTypeConfig, NativeObjectType} from '$tl/objects/objectTypes'

const htmlElementAdapter: NativeObjectAdapter = {
  accepts(nativeObject: mixed): boolean {
    return nativeObject instanceof HTMLElement
  },
  getType(
    nativeObject: HTMLElement,
    config: NativeObjectTypeConfig,
  ): NativeObjectType {
    return {
      props: {}
    }
  },
}

export default htmlElementAdapter
