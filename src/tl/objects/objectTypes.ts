import Project from '$tl/Project/Project'

export interface NativeObjectTypeConfig {}

export interface NativeObjectType {}

export const getTypeOfNativeObject = (
  project: Project,
  nativeObject: $FixMe,
  config: NativeObjectTypeConfig,
): NativeObjectType | null => {
  const adapter = project.adapters.findAdapterForNativeObject(nativeObject)
  if (!adapter) return null
  return adapter.getType(nativeObject, config)
}
