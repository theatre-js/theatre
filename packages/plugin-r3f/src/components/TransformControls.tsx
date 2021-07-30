import type {Object3D, Event} from 'three'
import React, {forwardRef, useLayoutEffect, useEffect, useMemo} from 'react'
import type {ReactThreeFiber, Overwrite} from '@react-three/fiber'
import {useThree} from '@react-three/fiber'
import {TransformControls as TransformControlsImpl} from 'three/examples/jsm/controls/TransformControls'
import type {OrbitControls} from 'three-stdlib'

type R3fTransformControls = Overwrite<
  ReactThreeFiber.Object3DNode<
    TransformControlsImpl,
    typeof TransformControlsImpl
  >,
  {target?: ReactThreeFiber.Vector3}
>

export interface TransformControlsProps extends R3fTransformControls {
  object: Object3D
  orbitControlsRef?: React.MutableRefObject<OrbitControls | null>
  onObjectChange?: (event: Event) => void
  onDraggingChange?: (event: Event) => void
}

const TransformControls = forwardRef(
  (
    {
      children,
      object,
      orbitControlsRef,
      onObjectChange,
      onDraggingChange,
      ...props
    }: TransformControlsProps,
    ref,
  ) => {
    const {camera, gl, invalidate} = useThree()
    const controls = useMemo(
      () => new TransformControlsImpl(camera, gl.domElement),
      [camera, gl.domElement],
    )

    useLayoutEffect(() => {
      controls.attach(object)

      return () => void controls.detach()
    }, [object, controls])

    useEffect(() => {
      controls?.addEventListener?.('change', invalidate)
      return () => controls?.removeEventListener?.('change', invalidate)
    }, [controls, invalidate])

    useEffect(() => {
      const callback = (event: Event) => {
        if (orbitControlsRef && orbitControlsRef.current) {
          // @ts-ignore TODO
          orbitControlsRef.current.enabled = !event.value
        }
      }

      if (controls) {
        controls.addEventListener!('dragging-changed', callback)
      }

      return () => {
        controls.removeEventListener!('dragging-changed', callback)
      }
    }, [controls, orbitControlsRef])

    useEffect(() => {
      if (onObjectChange) {
        controls.addEventListener('objectChange', onObjectChange)
      }

      return () => {
        if (onObjectChange) {
          controls.removeEventListener('objectChange', onObjectChange)
        }
      }
    }, [onObjectChange, controls])

    useEffect(() => {
      if (onDraggingChange) {
        controls.addEventListener('dragging-changed', onDraggingChange)
      }

      return () => {
        if (onDraggingChange) {
          controls.removeEventListener('dragging-changed', onDraggingChange)
        }
      }
    }, [controls, onDraggingChange])

    return <primitive dispose={null} object={controls} ref={ref} {...props} />
  },
)

export default TransformControls
