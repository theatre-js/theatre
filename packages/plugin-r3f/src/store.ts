import type {StateCreator} from 'zustand'
import create from 'zustand'
import type {Object3D, Scene, WebGLRenderer} from 'three'
import {Group} from 'three'
import type {ISheet, ISheetObject} from '@theatre/core'
import {types, getProject} from '@theatre/core'

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

export const baseSheetObjectType = types.compound({
  position: types.compound({
    x: types.number(0),
    y: types.number(0),
    z: types.number(0),
  }),
  rotation: types.compound({
    x: types.number(0),
    y: types.number(0),
    z: types.number(0),
  }),
  scale: types.compound({
    x: types.number(1),
    y: types.number(1),
    z: types.number(1),
  }),
})

export type BaseSheetObjectType = ISheetObject<typeof baseSheetObjectType>

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
  sheet: ISheet | null
  editorObject: ISheetObject<typeof editorSheetObjectConfig> | null
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
    sheet: ISheet,
    editorObject: null | ISheetObject<typeof editorSheetObjectConfig>,
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

    init: (scene, gl, allowImplicitInstancing, sheet, editorObject) => {
      set({
        scene,
        gl,
        allowImplicitInstancing,
        sheet,
        editorObject,
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
  sheet: ISheet
}) => (options: {gl: WebGLRenderer; scene: Scene}) => void

const editorSheetObjectConfig = types.compound({
  isOpen: types.boolean(false, {label: 'Editor Open'}),
  viewport: types.compound(
    {
      showAxes: types.boolean(true, {label: 'Axes'}),
      showGrid: types.boolean(true, {label: 'Grid'}),
      showOverlayIcons: types.boolean(false, {label: 'Overlay Icons'}),
      resolution: types.number(1440, {
        label: 'Resolution',
        range: [0, 1000],
      }),
      shading: types.stringLiteral(
        'rendered',
        {
          flat: 'Flat',
          rendered: 'Rendered',
          solid: 'Solid',
          wireframe: 'Wireframe',
        },
        {as: 'menu', label: 'Shading'},
      ),
    },
    {label: 'Viewport Config'},
  ),
  transformControls: types.compound(
    {
      mode: types.stringLiteral(
        'translate',
        {
          translate: 'Translate',
          rotate: 'Rotate',
          scale: 'Scale',
        },
        {as: 'switch', label: 'Mode'},
      ),
      space: types.stringLiteral(
        'world',
        {
          local: 'Local',
          world: 'World',
        },
        {as: 'switch', label: 'Space'},
      ),
    },
    {label: 'Transform Controls'},
  ),
})

export const bindToCanvas: BindFunction = ({
  allowImplicitInstancing = false,
  sheet,
}) => {
  const uiSheet: null | ISheet =
    process.env.NODE_ENV === 'development'
      ? getProject('R3F Plugin').sheet('UI')
      : null

  const editorSheetObject =
    uiSheet?.object('Editor', null, editorSheetObjectConfig) || null

  return ({gl, scene}) => {
    const init = useEditorStore.getState().init
    init(scene, gl, allowImplicitInstancing, sheet, editorSheetObject)
  }
}
