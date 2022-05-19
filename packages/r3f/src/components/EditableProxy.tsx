import type {Object3D} from 'three'
import type {VFC} from 'react'
import React, {useEffect, useLayoutEffect, useMemo, useState} from 'react'
import {Sphere, Html} from '@react-three/drei'
import {useEditorStore} from '../store'
import shallow from 'zustand/shallow'
import studio from '@theatre/studio'
import {useSelected} from './useSelected'
import {useVal} from '@theatre/react'
import {getEditorSheetObject} from './editorStuff'
import type {IconID} from '../icons'
import icons from '../icons'
import type {Helper} from '../editableFactoryConfigUtils'
import {invalidate, useFrame, useThree} from '@react-three/fiber'
import {useDragDetector} from './DragDetector'

export interface EditableProxyProps {
  storeKey: string
  object: Object3D
}

const EditableProxy: VFC<EditableProxyProps> = ({storeKey, object}) => {
  const editorObject = getEditorSheetObject()
  const [setSnapshotProxyObject, editables] = useEditorStore(
    (state) => [state.setSnapshotProxyObject, state.editables],
    shallow,
  )

  const dragging = useDragDetector()

  const editable = editables[storeKey]

  const selected = useSelected()
  const showOverlayIcons =
    useVal(editorObject?.props.viewport.showOverlayIcons) ?? false

  useEffect(() => {
    setSnapshotProxyObject(object, storeKey)

    return () => setSnapshotProxyObject(null, storeKey)
  }, [storeKey, object, setSnapshotProxyObject])

  useLayoutEffect(() => {
    const originalVisibility = object.visible

    if (editable.visibleOnlyInEditor) {
      object.visible = true
    }

    return () => {
      object.visible = originalVisibility
    }
  }, [editable.visibleOnlyInEditor, object.visible])

  const [hovered, setHovered] = useState(false)

  // Helpers
  const scene = useThree((state) => state.scene)
  const helper = useMemo<Helper | undefined>(
    () => editable.objectConfig.createHelper?.(object),
    [object],
  )
  useEffect(() => {
    if (helper == undefined) {
      return
    }

    if (selected === storeKey || hovered) {
      scene.add(helper)
      invalidate()
    }

    return () => {
      scene.remove(helper)
      invalidate()
    }
  }, [selected, hovered, helper, scene])
  useFrame(() => {
    if (helper == undefined) {
      return
    }

    if (helper.update) {
      helper.update()
    }
  })
  useEffect(() => {
    if (dragging) {
      setHovered(false)
    }
  }, [dragging])

  // subscribe to external changes
  useEffect(() => {
    const sheetObject = editable.sheetObject
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
  }, [editable])

  return (
    <>
      <group
        onClick={(e) => {
          if (e.delta < 2) {
            e.stopPropagation()

            const theatreObject =
              useEditorStore.getState().editables[storeKey].sheetObject

            if (!theatreObject) {
              console.log('no theatre object for', storeKey)
            } else {
              studio.setSelection([theatreObject])
            }
          }
        }}
        onPointerOver={
          !dragging
            ? (e) => {
                e.stopPropagation()
                setHovered(true)
              }
            : undefined
        }
        onPointerOut={
          !dragging
            ? (e) => {
                e.stopPropagation()
                setHovered(false)
              }
            : undefined
        }
      >
        <primitive object={object}>
          {(showOverlayIcons ||
            (editable.objectConfig.dimensionless && selected !== storeKey)) && (
            <Html
              center
              style={{
                pointerEvents: 'none',
                transform: 'scale(2)',
                opacity: hovered ? 0.3 : 1,
              }}
            >
              <div>{icons[editable.objectConfig.icon as IconID]}</div>
            </Html>
          )}
          {editable.objectConfig.dimensionless && (
            <Sphere
              args={[2, 4, 2]}
              onClick={(e) => {
                if (e.delta < 2) {
                  e.stopPropagation()
                  const theatreObject =
                    useEditorStore.getState().editables[storeKey].sheetObject

                  if (!theatreObject) {
                    console.log('no theatre object for', storeKey)
                  } else {
                    studio.setSelection([theatreObject])
                  }
                }
              }}
              userData={{helper: true}}
            >
              <meshBasicMaterial visible={false} />
            </Sphere>
          )}
        </primitive>
      </group>
    </>
  )
}

export default EditableProxy
