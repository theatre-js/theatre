import Project from '$tl/Project/Project'
import {AllPossiblePropTypes} from './propTypes'

// type NumberType = {type: 'number', range: [number, number]}

// type Position3d = {type: 'position3d'}

export type PropDescriptor = AllPossiblePropTypes

export interface NativeObjectTypeConfig extends NativeObjectType {}

export type ObjectProps = {[key: string]: PropDescriptor}

export interface NativeObjectType {
  props: ObjectProps
}

export const getAdapterOfNativeObject = (
  project: Project,
  nativeObject: $FixMe,
  config?: NativeObjectTypeConfig,
) => {
  const adapter = project.adapters.findAdapterForNativeObject(nativeObject)
  return adapter
}
