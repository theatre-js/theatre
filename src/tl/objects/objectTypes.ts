import Project from '$tl/Project/Project'
import {AllPossiblePropTypes} from './propTypes'

// type NumberType = {type: 'number', range: [number, number]}

// type Position3d = {type: 'position3d'}

type PropDescriptor = AllPossiblePropTypes

export interface NativeObjectTypeConfig {}

export interface NativeObjectType {
  props: {[key: string]: PropDescriptor}
}

export const getTypeOfNativeObject = (
  project: Project,
  nativeObject: $FixMe,
  config?: NativeObjectTypeConfig,
): NativeObjectType | null => {
  const adapter = project.adapters.findAdapterForNativeObject(nativeObject)
  if (!adapter) return null
  return adapter.getType(nativeObject, config)
}

