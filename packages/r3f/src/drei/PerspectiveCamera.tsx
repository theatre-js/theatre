import * as React from 'react'
import type {PerspectiveCamera as PerspectiveCameraImpl, Object3D} from 'three'
import {useFrame, useThree} from '@react-three/fiber'
import {mergeRefs} from 'react-merge-refs'
import {editable} from '../index'
import {Vector3} from 'three'
import {editorStore} from '../main/store'
import type {MutableRefObject} from 'react'

export type PerspectiveCameraProps = Omit<
  JSX.IntrinsicElements['perspectiveCamera'],
  'lookAt'
> & {
  lookAt?:
    | [number, number, number]
    | Vector3
    | MutableRefObject<Object3D | null | undefined>
  makeDefault?: boolean
  manual?: boolean
  children?: React.ReactNode
}

export const PerspectiveCamera = editable(
  React.forwardRef(
    ({makeDefault, lookAt, ...props}: PerspectiveCameraProps, ref) => {
      const set = useThree(({set}) => set)
      const camera = useThree(({camera}) => camera)
      const size = useThree(({size}) => size)
      const cameraRef = React.useRef<PerspectiveCameraImpl>(null!)

      React.useLayoutEffect(() => {
        if (!props.manual) {
          cameraRef.current.aspect = size.width / size.height
        }
      }, [size, props])

      React.useLayoutEffect(() => {
        cameraRef.current.updateProjectionMatrix()
      })

      React.useLayoutEffect(() => {
        if (makeDefault) {
          const oldCam = camera
          set(() => ({camera: cameraRef.current!}))
          return () => set(() => ({camera: oldCam}))
        }
        // The camera should not be part of the dependency list because this components camera is a stable reference
        // that must exchange the default, and clean up after itself on unmount.
      }, [cameraRef, makeDefault, set])

      useFrame(() => {
        if (lookAt && cameraRef.current) {
          cameraRef.current.lookAt(
            Array.isArray(lookAt)
              ? new Vector3(...lookAt)
              : (lookAt as MutableRefObject<Object3D>).current
              ? (lookAt as MutableRefObject<Object3D>).current.position
              : (lookAt as Vector3),
          )

          // how could we make it possible for users to do something like this too?
          const snapshot = editorStore.getState().editablesSnapshot
          if (snapshot) {
            snapshot[
              cameraRef.current.userData.__storeKey
            ].proxyObject?.rotation.copy(cameraRef.current.rotation)
          }
        }
      })

      return <perspectiveCamera ref={mergeRefs([cameraRef, ref])} {...props} />
    },
  ),
  'perspectiveCamera',
)
