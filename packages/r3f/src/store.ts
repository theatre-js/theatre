import type {StateCreator} from 'zustand'
import create from 'zustand'
import type {Object3D, Scene, WebGLRenderer} from 'three'
import {Group} from 'three'
import type {ISheetObject} from '@theatre/core'
import {types} from '@theatre/core'

export type EditableType =
  | 'group'
  | 'mesh'
  | 'spotLight'
  | 'directionalLight'
  | 'pointLight'
  | 'perspectiveCamera'
  | 'orthographicCamera'

export type TransformControlsMode = 'translate' | 'rotate' | 'scale'
export type TransformControlsSpace = 'world' | 'local'
export type ViewportShading = 'wireframe' | 'flat' | 'solid' | 'rendered'

const positionComp = types.number(1, {nudgeMultiplier: 0.1})
const rotationComp = types.number(1, {nudgeMultiplier: 0.02})
const scaleComp = types.number(1, {nudgeMultiplier: 0.1})

export const baseSheetObjectType = types.compound({
  position: types.compound({
    x: positionComp,
    y: positionComp,
    z: positionComp,
  }),
  rotation: types.compound({
    x: rotationComp,
    y: rotationComp,
    z: rotationComp,
  }),
  scale: types.compound({
    x: scaleComp,
    y: scaleComp,
    z: scaleComp,
  }),
})

export type BaseSheetObjectType = ISheetObject<typeof baseSheetObjectType>

export const allRegisteredObjects = new WeakSet<BaseSheetObjectType>()

export interface AbstractEditable<T extends EditableType> {
  type: T
  role: 'active' | 'removed'
  sheetObject?: ISheetObject<any>
}

// all these identical types are to prepare for a future in which different object types have different properties
export interface EditableGroup extends AbstractEditable<'group'> {
  sheetObject?: BaseSheetObjectType
}

export interface EditableMesh extends AbstractEditable<'mesh'> {
  sheetObject?: BaseSheetObjectType
}

export interface EditableSpotLight extends AbstractEditable<'spotLight'> {
  sheetObject?: BaseSheetObjectType
}

export interface EditableDirectionalLight
  extends AbstractEditable<'directionalLight'> {
  sheetObject?: BaseSheetObjectType
}

export interface EditablePointLight extends AbstractEditable<'pointLight'> {
  sheetObject?: BaseSheetObjectType
}

export interface EditablePerspectiveCamera
  extends AbstractEditable<'perspectiveCamera'> {
  sheetObject?: BaseSheetObjectType
}

export interface EditableOrthographicCamera
  extends AbstractEditable<'orthographicCamera'> {
  sheetObject?: BaseSheetObjectType
}

export type Editable =
  | EditableGroup
  | EditableMesh
  | EditableSpotLight
  | EditableDirectionalLight
  | EditablePointLight
  | EditablePerspectiveCamera
  | EditableOrthographicCamera

export type EditableSnapshot<T extends Editable = Editable> = {
  proxyObject?: Object3D | null
} & T

export interface AbstractSerializedEditable<T extends EditableType> {
  type: T
}

export interface SerializedEditableGroup
  extends AbstractSerializedEditable<'group'> {}

export interface SerializedEditableMesh
  extends AbstractSerializedEditable<'mesh'> {}

export interface SerializedEditableSpotLight
  extends AbstractSerializedEditable<'spotLight'> {}

export interface SerializedEditableDirectionalLight
  extends AbstractSerializedEditable<'directionalLight'> {}

export interface SerializedEditablePointLight
  extends AbstractSerializedEditable<'pointLight'> {}

export interface SerializedEditablePerspectiveCamera
  extends AbstractSerializedEditable<'perspectiveCamera'> {}

export interface SerializedEditableOrthographicCamera
  extends AbstractSerializedEditable<'orthographicCamera'> {}

export type SerializedEditable =
  | SerializedEditableGroup
  | SerializedEditableMesh
  | SerializedEditableSpotLight
  | SerializedEditableDirectionalLight
  | SerializedEditablePointLight
  | SerializedEditablePerspectiveCamera
  | SerializedEditableOrthographicCamera

export interface EditableState {
  editables: Record<string, SerializedEditable>
}

export type EditorStore = {
  sheetObjects: {[uniqueName in string]?: BaseSheetObjectType}
  scene: Scene | null
  gl: WebGLRenderer | null
  allowImplicitInstancing: boolean
  helpersRoot: Group
  editables: Record<string, Editable>
  // this will come in handy when we start supporting multiple canvases
  canvasName: string
  sceneSnapshot: Scene | null
  editablesSnapshot: Record<string, EditableSnapshot> | null

  init: (
    scene: Scene,
    gl: WebGLRenderer,
    allowImplicitInstancing: boolean,
  ) => void

  addEditable: <T extends EditableType>(type: T, uniqueName: string) => void
  removeEditable: (uniqueName: string) => void
  createSnapshot: () => void
  setSheetObject: (uniqueName: string, sheetObject: BaseSheetObjectType) => void
  setSnapshotProxyObject: (
    proxyObject: Object3D | null,
    uniqueName: string,
  ) => void
}

const config: StateCreator<EditorStore> = (set, get) => {
  return {
    sheet: null,
    editorObject: null,
    sheetObjects: {},
    scene: null,
    gl: null,
    allowImplicitInstancing: false,
    helpersRoot: new Group(),
    editables: {},
    canvasName: 'default',
    sceneSnapshot: null,
    editablesSnapshot: null,
    initialEditorCamera: {},

    init: (scene, gl, allowImplicitInstancing) => {
      set({
        scene,
        gl,
        allowImplicitInstancing,
      })
    },

    addEditable: (type, uniqueName) =>
      set((state) => {
        if (state.editables[uniqueName]) {
          if (
            state.editables[uniqueName].type !== type &&
            process.env.NODE_ENV === 'development'
          ) {
            console.error(`Warning: There is a mismatch between the serialized type of ${uniqueName} and the one set when adding it to the scene.
  Serialized: ${state.editables[uniqueName].type}.
  Current: ${type}.
  
  This might have happened either because you changed the type of an object, in which case a re-export will solve the issue, or because you re-used the uniqueName for an object of a different type, which is an error.`)
          }
          if (
            state.editables[uniqueName].role === 'active' &&
            !state.allowImplicitInstancing
          ) {
            throw Error(
              `Scene already has an editable object named ${uniqueName}.
  If this is intentional, please set the allowImplicitInstancing prop of EditableManager to true.`,
            )
          } else {
          }
        }

        return {
          editables: {
            ...state.editables,
            [uniqueName]: {
              type: type as EditableType,
              role: 'active',
            },
          },
        }
      }),

    removeEditable: (name) =>
      set((state) => {
        const {[name]: removed, ...rest} = state.editables
        return {
          editables: {
            ...rest,
            [name]: {...removed, role: 'removed'},
          },
        }
      }),
    setSheetObject: (uniqueName, sheetObject) => {
      set((state) => ({
        sheetObjects: {
          ...state.sheetObjects,
          [uniqueName]: sheetObject,
        },
      }))
    },

    createSnapshot: () => {
      set((state) => ({
        sceneSnapshot: state.scene?.clone() ?? null,
        editablesSnapshot: state.editables,
      }))
    },
    setSnapshotProxyObject: (proxyObject, uniqueName) => {
      set((state) => ({
        editablesSnapshot: {
          ...state.editablesSnapshot,
          [uniqueName]: {
            ...state.editablesSnapshot![uniqueName],
            proxyObject,
          },
        },
      }))
    },
  }
}

export const useEditorStore = create<EditorStore>(config)

export type BindFunction = (options: {
  allowImplicitInstancing?: boolean
  gl: WebGLRenderer
  scene: Scene
}) => void

export const bindToCanvas: BindFunction = ({
  allowImplicitInstancing = false,
  gl,
  scene,
}) => {
  const init = useEditorStore.getState().init
  init(scene, gl, allowImplicitInstancing)
}
