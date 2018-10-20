import Project from '$tl/Project/Project'
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
  project: Project,
  nativeObject: $FixMe,
  config?: NativeObjectTypeConfig,
): NativeObjectType | null => {
  if (config && config.type) return config.type
  const adapter = getAdapterOfNativeObject(project, nativeObject, config)
  if (!adapter) return null
  return adapter.getType(nativeObject, config)
}

export const getAdapterOfNativeObject = (
  project: Project,
  nativeObject: $FixMe,
  config?: NativeObjectTypeConfig,
) => {
  const adapter = project.adapters.findAdapterForNativeObject(nativeObject)
  return adapter
}
