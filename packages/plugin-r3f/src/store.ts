import type {StateCreator} from 'zustand'
import create from 'zustand'
import type {Object3D, Scene, WebGLRenderer} from 'three'
import {DefaultLoadingManager, Group} from 'three'
import type {MutableRefObject} from 'react'
import type {OrbitControls} from '@react-three/drei'
// @ts-ignore TODO
import type {ContainerProps} from '@react-three/fiber'
import type {ISheet, ISheetObject} from '@theatre/core'
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

export const createBaseObjectConfig = () => {
  const {compound, number} = types
  return {
    props: compound({
      position: compound({
        x: number(0),
        y: number(0),
        z: number(0),
      }),
      rotation: compound({
        x: number(0),
        y: number(0),
        z: number(0),
      }),
      scale: compound({
        x: number(1),
        y: number(1),
        z: number(1),
      }),
    }),
  }
}

export const getBaseObjectConfig = (() => {
  let base: undefined | ReturnType<typeof createBaseObjectConfig>
  return (): ReturnType<typeof createBaseObjectConfig> => {
    if (!base) {
      base = createBaseObjectConfig()
    }
    return base!
  }
})()

export type BaseSheetObjectType = ISheetObject<
  ReturnType<typeof getBaseObjectConfig>['props']
>

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
  sheetObjects: {[uniqueName in string]?: BaseSheetObjectType}
  scene: Scene | null
  gl: WebGLRenderer | null
  allowImplicitInstancing: boolean
  orbitControlsRef: MutableRefObject<typeof OrbitControls | undefined> | null
  helpersRoot: Group
  editables: Record<string, Editable>
  // this will come in handy when we start supporting multiple canvases
  canvasName: string
  initialState: EditableState | null
  selected: string | null
  transformControlsMode: TransformControlsMode
  transformControlsSpace: TransformControlsSpace
  viewportShading: ViewportShading
  editorOpen: boolean
  sceneSnapshot: Scene | null
  editablesSnapshot: Record<string, EditableSnapshot> | null
  hdrPaths: string[]
  selectedHdr: string | null
  showOverlayIcons: boolean
  useHdrAsBackground: boolean
  showGrid: boolean
  showAxes: boolean
  referenceWindowSize: number
  initialEditorCamera: ContainerProps['camera']

  init: (
    scene: Scene,
    gl: WebGLRenderer,
    allowImplicitInstancing: boolean,
    editorCamera: ContainerProps['camera'],
    sheet: ISheet,
    initialState?: EditableState,
  ) => void

  setOrbitControlsRef: (
    orbitControlsRef: MutableRefObject<typeof OrbitControls | undefined>,
  ) => void
  addEditable: <T extends EditableType>(type: T, uniqueName: string) => void
  removeEditable: (uniqueName: string) => void
  setSelectedHdr: (hdr: string | null) => void
  setTransformControlsMode: (mode: TransformControlsMode) => void
  setTransformControlsSpace: (mode: TransformControlsSpace) => void
  setViewportShading: (mode: ViewportShading) => void
  setShowOverlayIcons: (show: boolean) => void
  setUseHdrAsBackground: (use: boolean) => void
  setShowGrid: (show: boolean) => void
  setShowAxes: (show: boolean) => void
  setReferenceWindowSize: (size: number) => void
  setEditorOpen: (open: boolean) => void
  createSnapshot: () => void
  setSheetObject: (uniqueName: string, sheetObject: BaseSheetObjectType) => void
  setSnapshotProxyObject: (
    proxyObject: Object3D | null,
    uniqueName: string,
  ) => void
}

interface PersistedState {
  canvases: {
    [name: string]: EditableState
  }
}

const config: StateCreator<EditorStore> = (set, get) => {
  setTimeout(() => {
    const existingHandler = DefaultLoadingManager.onProgress
    DefaultLoadingManager.onProgress = (url, loaded, total) => {
      existingHandler(url, loaded, total)
      if (url.match(/\.hdr$/)) {
        set((state) => {
          const newPaths = new Set(state.hdrPaths)
          newPaths.add(url)
          const selectedHdr = newPaths.size === 1 ? url : state.selectedHdr
          return {hdrPaths: Array.from(newPaths), selectedHdr}
        })
      }
    }
  })

  return {
    sheet: null,
    sheetObjects: {},
    scene: null,
    gl: null,
    allowImplicitInstancing: false,
    orbitControlsRef: null,
    helpersRoot: new Group(),
    editables: {},
    canvasName: 'default',
    initialState: null,
    selected: null,
    transformControlsMode: 'translate',
    transformControlsSpace: 'world',
    viewportShading: 'rendered',
    editorOpen: false,
    sceneSnapshot: null,
    editablesSnapshot: null,
    hdrPaths: [],
    selectedHdr: null,
    showOverlayIcons: false,
    useHdrAsBackground: false,
    showGrid: true,
    showAxes: true,
    referenceWindowSize: 120,
    initialEditorCamera: {},

    init: (
      scene,
      gl,
      allowImplicitInstancing,
      editorCamera,
      sheet,
      initialState,
    ) => {
      const editables = get().editables

      const newEditables: Record<string, Editable> = initialState
        ? Object.fromEntries(
            Object.entries(initialState.editables).map(
              ([name, initialEditable]) => {
                const originalEditable = editables[name]
                return [
                  name,
                  {
                    type: initialEditable.type,
                    role: originalEditable?.role ?? 'removed',
                  },
                ]
              },
            ),
          )
        : editables

      set({
        scene,
        gl,
        allowImplicitInstancing,
        editables: newEditables,
        initialEditorCamera: editorCamera,
        initialState: initialState ?? null,
        sheet,
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
    setOrbitControlsRef: (camera) => {
      set({orbitControlsRef: camera})
    },
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
    setSelectedHdr: (hdr) => {
      set({selectedHdr: hdr})
    },
    setTransformControlsMode: (mode) => {
      set({transformControlsMode: mode})
    },
    setTransformControlsSpace: (mode) => {
      set({transformControlsSpace: mode})
    },
    setViewportShading: (mode) => {
      set({viewportShading: mode})
    },
    setShowOverlayIcons: (show) => {
      set({showOverlayIcons: show})
    },
    setUseHdrAsBackground: (use) => {
      set({useHdrAsBackground: use})
    },
    setShowGrid: (show) => {
      set({showGrid: show})
    },
    setShowAxes: (show) => {
      set({showAxes: show})
    },
    setReferenceWindowSize: (size) => set({referenceWindowSize: size}),
    setEditorOpen: (open) => {
      set({editorOpen: open})
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
  state?: EditableState
  editorCamera?: ContainerProps['camera']
  sheet: ISheet
}) => (options: {gl: WebGLRenderer; scene: Scene}) => void

export const configure = ({} = {}): BindFunction => {
  return ({
    allowImplicitInstancing = false,
    state,
    editorCamera = {},
    sheet,
  }) => {
    return ({gl, scene}) => {
      const init = useEditorStore.getState().init
      init(
        scene,
        gl,
        allowImplicitInstancing,
        {...{position: [20, 20, 20]}, ...editorCamera},
        sheet,
        state,
      )
    }
  }
}
