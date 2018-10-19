import InternalProject from '$tl/Project/InternalProject'
import {AllPossiblePropTypes} from './propTypes'

// type NumberType = {type: 'number', range: [number, number]}

// type Position3d = {type: 'position3d'}

type PropDescriptor = AllPossiblePropTypes

export interface NativeObjectTypeConfig {
  type: NativeObjectType
}

export interface NativeObjectType {
  props: {[key: string]: PropDescriptor}
}

export const getTypeOfNativeObject = (
  internalProject: InternalProject,
  nativeObject: $FixMe,
  config?: NativeObjectTypeConfig,
): NativeObjectType | null => {
  if (config && config.type) return config.type
  const adapter = getAdapterOfNativeObject(internalProject, nativeObject, config)
  if (!adapter) return null
  return adapter.getType(nativeObject, config)
}

export const getAdapterOfNativeObject = (
  internalProject: InternalProject,
  nativeObject: $FixMe,
  config?: NativeObjectTypeConfig,
) => {
  const adapter = internalProject.adapters.findAdapterForNativeObject(nativeObject)
  return adapter
}
