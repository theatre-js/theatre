import type {FC} from 'react'
import React, {useLayoutEffect, useMemo, useRef, useState} from 'react'
import type {Editable} from '../../main/store'
import {createPortal, invalidate} from '@react-three/fiber'
import EditableProxy from './EditableProxy'
import type {OrbitControls} from 'three-stdlib'
import TransformControls from './TransformControls'
import shallow from 'zustand/shallow'
import type {Material, Mesh, Object3D} from 'three'
import {MeshBasicMaterial, MeshPhongMaterial} from 'three'
import {getStudioSync, type IScrub} from '@theatre/core'
import {useSelected} from './useSelected'
import {useVal} from '@theatre/react'
import {getEditorSheetObject} from '../editorStuff'
import useExtensionStore from '../useExtensionStore'

export interface ProxyManagerProps {
  orbitControlsRef: React.MutableRefObject<OrbitControls | null>
}

type IEditableProxy<T> = {
  portal: ReturnType<typeof createPortal>
  object: Object3D
  editable: Editable<T>
}

const ProxyManager: FC<ProxyManagerProps> = ({orbitControlsRef}) => {
  const isBeingEdited = useRef(false)
  const editorObject = getEditorSheetObject()
  const [sceneSnapshot, editables] = useExtensionStore(
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
  const [editableProxies, setEditableProxies] = useState<{
    [name in string]?: IEditableProxy<any>
  }>({})

  // set up scene proxies
  useLayoutEffect(() => {
    if (!sceneProxy) {
      return
    }

    const editableProxies: {[name: string]: IEditableProxy<any>} = {}

    sceneProxy.traverse((object) => {
      if (object.userData.__editable) {
        const theatreKey = object.userData.__storeKey

        if (
          // there are duplicate theatreKeys in the scene, only display one instance in the editor
          editableProxies[theatreKey] ||
          // this object has been unmounted
          !editables[theatreKey]
        ) {
          object.parent!.remove(object)
        } else {
          editableProxies[theatreKey] = {
            portal: (
              // we gotta wrap the portal because as of [this commit](https://github.com/pmndrs/react-three-fiber/commit/5d1652ce5b63397ad79c39d3dd100b26a465c41f)
              // in react-three-fiber, portals use the uuid of their parent object as their own key. Since many of these objects are nested
              // inside the same parent, they end up having the same react key. We avoid this issue by wrapping the portal in a component
              // so that its react key is unique within its parent component.
              <PortalWrapper
                portal={createPortal(
                  <EditableProxy storeKey={theatreKey} object={object} />,
                  object.parent!,
                )}
                key={`portal-wrapper-${theatreKey}`}
              />
            ),
            object: object,
            editable: editables[theatreKey]!,
          }
        }
      }
    })

    setEditableProxies(editableProxies)
  }, [orbitControlsRef, sceneProxy])

  const selected = useSelected()
  const editableProxyOfSelected = selected && editableProxies[selected]
  const editable = selected ? editables[selected] : undefined

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
      invalidate()
    })
  }, [viewportShading, renderMaterials, sceneProxy])

  const scrub = useRef<IScrub>(undefined!)

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

              // interestingly, for some reason, only updating a transform when it actually changes breaks it
              scrub.current.capture(({set}) => {
                if (transformControlsMode === 'translate') {
                  set(sheetObject.props.position, {
                    ...sheetObject.value.position,
                    x: obj.position.x,
                    y: obj.position.y,
                    z: obj.position.z,
                  })
                }
                if (transformControlsMode === 'rotate') {
                  set(sheetObject.props.rotation, {
                    ...sheetObject.value.rotation,
                    x: obj.rotation.x,
                    y: obj.rotation.y,
                    z: obj.rotation.z,
                  })
                }
                if (transformControlsMode === 'scale') {
                  set(sheetObject.props.scale, {
                    x: obj.scale.x,
                    y: obj.scale.y,
                    z: obj.scale.z,
                  })
                }
              })
            }}
            onDraggingChange={(event) => {
              if (event.value) {
                const studio = getStudioSync(true)!
                scrub.current = studio.scrub()
              } else {
                scrub.current.commit()
              }
              return (isBeingEdited.current = event.value)
            }}
          />
        )}
      {Object.values(editableProxies).map(
        (editableProxy) => editableProxy!.portal,
      )}
    </>
  )
}

const PortalWrapper: React.FC<{portal: React.ReactNode}> = ({portal}) => {
  return <>{portal}</>
}

export default ProxyManager
