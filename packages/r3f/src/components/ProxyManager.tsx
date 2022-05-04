import type {VFC} from 'react'
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {Editable} from '../store';
import { useEditorStore} from '../store'
import {createPortal} from '@react-three/fiber'
import EditableProxy from './EditableProxy'
import type {OrbitControls} from 'three-stdlib'
import TransformControls from './TransformControls'
import shallow from 'zustand/shallow'
import type {Material, Mesh, Object3D} from 'three'
import {MeshBasicMaterial, MeshPhongMaterial} from 'three'
import studio from '@theatre/studio'
import {useSelected} from './useSelected'
import {useVal} from '@theatre/react'
import useInvalidate from './useInvalidate'
import {getEditorSheetObject} from './editorStuff'

export interface ProxyManagerProps {
  orbitControlsRef: React.MutableRefObject<OrbitControls | null>
}

type IEditableProxy<T> = {
  portal: ReturnType<typeof createPortal>
  object: Object3D
  editable: Editable<T>
}

const ProxyManager: VFC<ProxyManagerProps> = ({orbitControlsRef}) => {
  const isBeingEdited = useRef(false)
  const editorObject = getEditorSheetObject()
  const [sceneSnapshot, editables] = useEditorStore(
    (state) => [state.sceneSnapshot, state.editables],
    shallow,
  )
  const transformControlsMode =
    useVal(editorObject?.props.transformControls.mode) ?? 'translate'

  const transformControlsSpace =
    useVal(editorObject?.props.transformControls.space) ?? 'world'

  const viewportShading =
    useVal(editorObject?.props.viewport.shading) ?? 'rendered'

  const sceneProxy = useMemo(() => sceneSnapshot?.clone(), [sceneSnapshot])
  const [editableProxies, setEditableProxies] = useState<
    {
      [name in string]?: IEditableProxy<any>
    }
  >({})

  const invalidate = useInvalidate()

  // set up scene proxies
  useLayoutEffect(() => {
    if (!sceneProxy) {
      return
    }

    const editableProxies: {[name: string]: IEditableProxy<any>} = {}

    sceneProxy.traverse((object) => {
      if (object.userData.__editable) {
        // there are duplicate uniqueNames in the scene, only display one instance in the editor
        if (editableProxies[object.userData.__editableName]) {
          object.parent!.remove(object)
        } else {
          const uniqueName = object.userData.__editableName

          editableProxies[uniqueName] = {
            portal: createPortal(
              <EditableProxy
                editableName={object.userData.__editableName}
                object={object}
              />,
              object.parent!,
            ),
            object: object,
            editable: editables[uniqueName]!,
          }
        }
      }
    })

    setEditableProxies(editableProxies)
  }, [orbitControlsRef, sceneProxy])

  const selected = useSelected()
  const editableProxyOfSelected = selected && editableProxies[selected]
  const editable = selected ? editables[selected] : undefined

  // subscribe to external changes
  useEffect(() => {
    if (!editableProxyOfSelected || !editable) return
    const object = editableProxyOfSelected.object
    const sheetObject = editableProxyOfSelected.editable.sheetObject
    const objectConfig = editable.objectConfig

    const setFromTheatre = (newValues: any) => {
      // @ts-ignore
      Object.entries(objectConfig.props).forEach(([key, value]) => {
        // @ts-ignore
        return value.apply(newValues[key], object)
      })
      objectConfig.updateObject?.(object)
      invalidate()
    }

    setFromTheatre(sheetObject.value)

    const untap = sheetObject.onValuesChange(setFromTheatre)

    return () => {
      untap()
    }
  }, [editableProxyOfSelected, selected])

  // set up viewport shading modes
  const [renderMaterials, setRenderMaterials] = useState<{
    [id: string]: Material | Material[]
  }>({})

  useLayoutEffect(() => {
    if (!sceneProxy) {
      return
    }

    const renderMaterials: {
      [id: string]: Material | Material[]
    } = {}

    sceneProxy.traverse((object) => {
      const mesh = object as Mesh
      if (mesh.isMesh && !mesh.userData.helper) {
        renderMaterials[mesh.id] = mesh.material
      }
    })

    setRenderMaterials(renderMaterials)

    return () => {
      // @todo do we need this cleanup?
      // Object.entries(renderMaterials).forEach(([id, material]) => {
      //   ;(sceneProxy.getObjectById(Number.parseInt(id)) as Mesh).material =
      //     material
      // })
    }
  }, [sceneProxy])

  useLayoutEffect(() => {
    if (!sceneProxy) {
      return
    }

    sceneProxy.traverse((object) => {
      const mesh = object as Mesh
      if (mesh.isMesh && !mesh.userData.helper) {
        let material
        switch (viewportShading) {
          case 'wireframe':
            mesh.material = new MeshBasicMaterial({
              wireframe: true,
              color: 'black',
            })
            break
          case 'flat':
            // it is possible that renderMaterials hasn't updated yet
            if (!renderMaterials[mesh.id]) {
              return
            }
            material = new MeshBasicMaterial()
            if (renderMaterials[mesh.id].hasOwnProperty('color')) {
              material.color = (renderMaterials[mesh.id] as any).color
            }
            if (renderMaterials[mesh.id].hasOwnProperty('map')) {
              material.map = (renderMaterials[mesh.id] as any).map
            }
            if (renderMaterials[mesh.id].hasOwnProperty('vertexColors')) {
              material.vertexColors = (
                renderMaterials[mesh.id] as any
              ).vertexColors
            }
            mesh.material = material
            break
          case 'solid':
            // it is possible that renderMaterials hasn't updated yet
            if (!renderMaterials[mesh.id]) {
              return
            }
            material = new MeshPhongMaterial()
            if (renderMaterials[mesh.id].hasOwnProperty('color')) {
              material.color = (renderMaterials[mesh.id] as any).color
            }
            if (renderMaterials[mesh.id].hasOwnProperty('map')) {
              material.map = (renderMaterials[mesh.id] as any).map
            }
            if (renderMaterials[mesh.id].hasOwnProperty('vertexColors')) {
              material.vertexColors = (
                renderMaterials[mesh.id] as any
              ).vertexColors
            }
            mesh.material = material
            break
          case 'rendered':
            mesh.material = renderMaterials[mesh.id]
        }
      }
    })
  }, [viewportShading, renderMaterials, sceneProxy])

  const scrub = useMemo(() => {
    return studio.debouncedScrub(1000)
  }, [selected, editableProxyOfSelected])

  if (!sceneProxy) {
    return null
  }

  return (
    <>
      <primitive object={sceneProxy} />
      {selected &&
        editableProxyOfSelected &&
        editable &&
        editable.objectConfig.useTransformControls && (
          <TransformControls
            mode={transformControlsMode}
            space={transformControlsSpace}
            orbitControlsRef={orbitControlsRef}
            object={editableProxyOfSelected.object}
            onObjectChange={() => {
              const sheetObject = editableProxyOfSelected.editable.sheetObject
              const obj = editableProxyOfSelected.object

              scrub.capture(({set}) => {
                set(sheetObject.props, {
                  ...sheetObject.value,
                  position: {
                    x: obj.position.x,
                    y: obj.position.y,
                    z: obj.position.z,
                  },
                  rotation: {
                    x: obj.rotation.x,
                    y: obj.rotation.y,
                    z: obj.rotation.z,
                  },
                  scale: {
                    x: obj.scale.x,
                    y: obj.scale.y,
                    z: obj.scale.z,
                  },
                })
              })
            }}
            onDraggingChange={(event) => (isBeingEdited.current = event.value)}
          />
        )}
      {Object.values(editableProxies).map(
        (editableProxy) => editableProxy!.portal,
      )}
    </>
  )
}

export default ProxyManager
