import type {Object3D} from 'three'
import {
  BoxHelper,
  CameraHelper,
  DirectionalLightHelper,
  PointLightHelper,
  SpotLightHelper,
} from 'three'
import type {ReactElement, VFC} from 'react'
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react'
import {useHelper, Sphere, Html} from '@react-three/drei'
import type {EditableType} from '../store'
import {useEditorStore} from '../store'
import shallow from 'zustand/shallow'
import {GiCube, GiLightBulb, GiLightProjector} from 'react-icons/gi'
import {BsCameraVideoFill, BsFillCollectionFill} from 'react-icons/bs'
import {BiSun} from 'react-icons/bi'
import type {IconType} from 'react-icons'
import studio from '@theatre/studio'
import {useSelected} from './useSelected'
import {useVal} from '@theatre/react'
import {getEditorSheetObject} from './editorStuff'

export interface EditableProxyProps {
  editableName: string
  editableType: EditableType
  object: Object3D
  onChange?: () => void
}

const EditableProxy: VFC<EditableProxyProps> = ({
  editableName: uniqueName,
  editableType,
  object,
}) => {
  const editorObject = getEditorSheetObject()
  const setSnapshotProxyObject = useEditorStore(
    (state) => state.setSnapshotProxyObject,
    shallow,
  )

  const selected = useSelected()
  const showOverlayIcons =
    useVal(editorObject?.props.viewport.showOverlayIcons) ?? false

  useEffect(() => {
    setSnapshotProxyObject(object, uniqueName)

    return () => setSnapshotProxyObject(null, uniqueName)
  }, [uniqueName, object, setSnapshotProxyObject])

  useLayoutEffect(() => {
    const originalVisibility = object.visible

    if (object.userData.__visibleOnlyInEditor) {
      object.visible = true
    }

    return () => {
      // this has absolutely no effect, __visibleOnlyInEditor of the snapshot never changes, I'm just doing it because it looks right 🤷‍️
      object.visible = originalVisibility
    }
  }, [object.userData.__visibleOnlyInEditor, object.visible])

  // set up helper
  let Helper:
    | typeof SpotLightHelper
    | typeof DirectionalLightHelper
    | typeof PointLightHelper
    | typeof BoxHelper
    | typeof CameraHelper

  switch (editableType) {
    case 'spotLight':
      Helper = SpotLightHelper
      break
    case 'directionalLight':
      Helper = DirectionalLightHelper
      break
    case 'pointLight':
      Helper = PointLightHelper
      break
    case 'perspectiveCamera':
    case 'orthographicCamera':
      Helper = CameraHelper
      break
    case 'group':
    case 'mesh':
      Helper = BoxHelper
  }

  let helperArgs: [string] | [number, string] | []
  const size = 1
  const color = 'darkblue'

  switch (editableType) {
    case 'directionalLight':
    case 'pointLight':
      helperArgs = [size, color]
      break
    case 'group':
    case 'mesh':
    case 'spotLight':
      helperArgs = [color]
      break
    case 'perspectiveCamera':
    case 'orthographicCamera':
      helperArgs = []
  }

  let icon: ReactElement<IconType>
  switch (editableType) {
    case 'group':
      icon = <BsFillCollectionFill />
      break
    case 'mesh':
      icon = <GiCube />
      break
    case 'pointLight':
      icon = <GiLightBulb />
      break
    case 'spotLight':
      icon = <GiLightProjector />
      break
    case 'directionalLight':
      icon = <BiSun />
      break
    case 'perspectiveCamera':
    case 'orthographicCamera':
      icon = <BsCameraVideoFill />
  }

  const objectRef = useRef(object)

  useLayoutEffect(() => {
    objectRef.current = object
  }, [object])

  const dimensionless = [
    'spotLight',
    'pointLight',
    'directionalLight',
    'perspectiveCamera',
    'orthographicCamera',
  ]

  const [hovered, setHovered] = useState(false)

  useHelper(
    objectRef,
    selected === uniqueName || dimensionless.includes(editableType) || hovered
      ? Helper
      : null,
    ...helperArgs,
  )

  return (
    <>
      <group
        onClick={(e) => {
          if (e.delta < 2) {
            e.stopPropagation()

            const theatreObject =
              useEditorStore.getState().sheetObjects[uniqueName]

            if (!theatreObject) {
              console.log('no theatre object for', uniqueName)
            } else {
              studio.setSelection([theatreObject])
            }
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setHovered(false)
        }}
      >
        <primitive object={object}>
          {showOverlayIcons && (
            <Html
              center
              className="pointer-events-none p-1 rounded bg-white bg-opacity-70 shadow text-gray-700"
            >
              {icon}
            </Html>
          )}
          {dimensionless.includes(editableType) && (
            <Sphere
              args={[2, 4, 2]}
              onClick={(e) => {
                if (e.delta < 2) {
                  e.stopPropagation()
                  const theatreObject =
                    useEditorStore.getState().sheetObjects[uniqueName]

                  if (!theatreObject) {
                    console.log('no theatre object for', uniqueName)
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
