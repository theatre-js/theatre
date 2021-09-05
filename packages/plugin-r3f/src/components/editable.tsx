import type {ComponentProps, ComponentType, RefAttributes} from 'react'
import React, {forwardRef, useLayoutEffect, useRef, useState} from 'react'
import type {
  DirectionalLight,
  Group,
  Mesh,
  OrthographicCamera,
  PerspectiveCamera,
  PointLight,
  SpotLight,
} from 'three'
import {Vector3} from 'three'
import type {EditableType} from '../store'
import {allRegisteredObjects} from '../store'
import {baseSheetObjectType} from '../store'
import {useEditorStore} from '../store'
import mergeRefs from 'react-merge-refs'
import type {$FixMe} from '@theatre/shared/utils/types'
import type {ISheetObject} from '@theatre/core'
import useInvalidate from './useInvalidate'

interface Elements {
  group: Group
  mesh: Mesh
  spotLight: SpotLight
  directionalLight: DirectionalLight
  perspectiveCamera: PerspectiveCamera
  orthographicCamera: OrthographicCamera
  pointLight: PointLight
}

const editable = <
  T extends ComponentType<any> | EditableType | 'primitive',
  U extends T extends EditableType ? T : EditableType,
>(
  Component: T,
  type: T extends 'primitive' ? null : U,
) => {
  type Props = Omit<ComponentProps<T>, 'visible'> & {
    uniqueName: string
    visible?: boolean | 'editor'
  } & (T extends 'primitive'
      ? {
          editableType: U
        }
      : {}) &
    RefAttributes<Elements[U]>

  return forwardRef(
    ({uniqueName, visible, editableType, ...props}: Props, ref) => {
      const objectRef = useRef<Elements[U]>()

      const sheet = useEditorStore((state) => state.sheet)

      const [sheetObject, setSheetObject] = useState<
        undefined | ISheetObject<$FixMe>
      >(undefined)

      const invalidate = useInvalidate()

      useLayoutEffect(() => {
        if (!sheet) return
        const sheetObject = sheet.object(uniqueName, baseSheetObjectType)
        allRegisteredObjects.add(sheetObject)
        setSheetObject(sheetObject)

        useEditorStore
          .getState()
          .setSheetObject(uniqueName, sheetObject as $FixMe)
      }, [sheet, uniqueName])

      const transformDeps: string[] = []

      ;['x', 'y', 'z'].forEach((axis) => {
        transformDeps.push(
          props[`position-${axis}` as any],
          props[`rotation-${axis}` as any],
          props[`scale-${axis}` as any],
        )
      })

      // store initial values of props
      useLayoutEffect(() => {
        if (!sheetObject) return
        // calculate initial properties before adding the editable
        const position: Vector3 = props.position
          ? Array.isArray(props.position)
            ? new Vector3(...(props.position as any))
            : props.position
          : new Vector3()
        const rotation: Vector3 = props.rotation
          ? Array.isArray(props.rotation)
            ? new Vector3(...(props.rotation as any))
            : props.rotation
          : new Vector3()
        const scale: Vector3 = props.scale
          ? Array.isArray(props.scale)
            ? new Vector3(...(props.scale as any))
            : props.scale
          : new Vector3(1, 1, 1)

        ;['x', 'y', 'z'].forEach((axis, index) => {
          if (props[`position-${axis}` as any])
            position.setComponent(index, props[`position-${axis}` as any])
          if (props[`rotation-${axis}` as any])
            rotation.setComponent(index, props[`rotation-${axis}` as any])
          if (props[`scale-${axis}` as any])
            scale.setComponent(index, props[`scale-${axis}` as any])
        })

        const initial = {
          position: {
            x: position.x,
            y: position.y,
            z: position.z,
          },
          rotation: {
            x: rotation.x,
            y: rotation.y,
            z: rotation.z,
          },
          scale: {
            x: scale.x,
            y: scale.y,
            z: scale.z,
          },
        }
        sheetObject!.initialValue = initial
      }, [
        uniqueName,
        sheetObject,
        props.position,
        props.rotation,
        props.scale,

        ...transformDeps,
      ])

      // subscribe to prop changes from theatre
      useLayoutEffect(() => {
        if (!sheetObject) return

        const object = objectRef.current!

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
          object.scale.set(
            newValues.scale.x,
            newValues.scale.y,
            newValues.scale.z,
          )
          invalidate()
        }

        setFromTheatre(sheetObject.value)

        const untap = sheetObject.onValuesChange(setFromTheatre)

        return () => {
          untap()
        }
      }, [sheetObject])

      return (
        // @ts-ignore
        <Component
          ref={mergeRefs([objectRef, ref])}
          {...props}
          visible={visible !== 'editor' && visible}
          userData={{
            __editable: true,
            __editableName: uniqueName,
            __editableType: type ?? editableType,
            __visibleOnlyInEditor: visible === 'editor',
          }}
        />
      )
    },
  )
}

const createEditable = <T extends EditableType>(type: T) =>
  // @ts-ignore
  editable(type, type)

editable.primitive = editable('primitive', null)
editable.group = createEditable('group')
editable.mesh = createEditable('mesh')
editable.spotLight = createEditable('spotLight')
editable.directionalLight = createEditable('directionalLight')
editable.pointLight = createEditable('pointLight')
editable.perspectiveCamera = createEditable('perspectiveCamera')
editable.orthographicCamera = createEditable('orthographicCamera')

export default editable
