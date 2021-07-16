import type {VFC} from 'react'
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {useEditorStore} from '../store'
import {createPortal} from '@react-three/fiber'
import EditableProxy from './EditableProxy'
import type {OrbitControls} from '@react-three/drei'
import TransformControls from './TransformControls'
import shallow from 'zustand/shallow'
import type {Material, Mesh, Object3D} from 'three'
import {MeshBasicMaterial, MeshPhongMaterial} from 'three'
import studio from '@theatre/studio'
import type {ISheetObject} from '@theatre/core'
import type {$FixMe} from '../types'
import {useSelected} from './useSelected'
import {useVal} from '@theatre/dataverse-react'

export interface ProxyManagerProps {
  orbitControlsRef: React.MutableRefObject<typeof OrbitControls | undefined>
}

type IEditableProxy = {
  portal: ReturnType<typeof createPortal>
  object: Object3D
  sheetObject: ISheetObject<$FixMe>
}

const ProxyManager: VFC<ProxyManagerProps> = ({orbitControlsRef}) => {
  const isBeingEdited = useRef(false)
  const [editorObject, sceneSnapshot, sheetObjects] = useEditorStore(
    (state) => [state.editorObject, state.sceneSnapshot, state.sheetObjects],
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
      [name in string]?: IEditableProxy
    }
  >({})

  // set up scene proxies
  useLayoutEffect(() => {
    if (!sceneProxy) {
      return
    }

    const editableProxies: {[name: string]: IEditableProxy} = {}

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
                editableType={object.userData.__editableType}
                object={object}
              />,
              object.parent!,
            ),
            object: object,
            sheetObject: sheetObjects[uniqueName]!,
          }
        }
      }
    })

    setEditableProxies(editableProxies)
  }, [orbitControlsRef, sceneProxy])

  const selected = useSelected()
  const editableProxyOfSelected = selected && editableProxies[selected]

  // subscribe to external changes
  useEffect(() => {
    if (!editableProxyOfSelected) return
    const object = editableProxyOfSelected.object
    const sheetObject = editableProxyOfSelected.sheetObject

    const setFromTheatre = (newValues: any) => {
      object.position.set(
        newValues.position.x,
        newValues.position.y,
        newValues.position.z,
      )
      object.rotation.set(
        newValues.rotation.x,
        newValues.rotation.y,
        newValues.rotation.z,
      )
      object.scale.set(newValues.scale.x, newValues.scale.y, newValues.scale.z)
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

  if (!sceneProxy) {
    return null
  }

  return (
    <>
      <primitive object={sceneProxy} />
      {selected && editableProxyOfSelected && (
        <TransformControls
          mode={transformControlsMode}
          space={transformControlsSpace}
          orbitControlsRef={orbitControlsRef}
          object={editableProxyOfSelected.object}
          onObjectChange={() => {
            const sheetObject = editableProxyOfSelected.sheetObject
            const obj = editableProxyOfSelected.object

            studio.transaction(({set}) => {
              set(sheetObject.props, {
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
