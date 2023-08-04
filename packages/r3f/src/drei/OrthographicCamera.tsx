import * as React from 'react'
import type {
  OrthographicCamera as OrthographicCameraImpl,
  Object3D,
} from 'three'
import {useFrame, useThree} from '@react-three/fiber'
import {mergeRefs} from 'react-merge-refs'
import {editable} from '../index'
import {Vector3} from 'three'
import type {MutableRefObject} from 'react'
import {editorStore} from '../main/store'

export type OrthographicCameraProps = Omit<
  JSX.IntrinsicElements['orthographicCamera'],
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

export const OrthographicCamera = editable(
  React.forwardRef(
    ({makeDefault, lookAt, ...props}: OrthographicCameraProps, ref) => {
      const set = useThree(({set}) => set)
      const camera = useThree(({camera}) => camera)
      const size = useThree(({size}) => size)
      const cameraRef = React.useRef<OrthographicCameraImpl>(null!)

      React.useLayoutEffect(() => {
        if (!props.manual) {
          cameraRef.current.updateProjectionMatrix()
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

      return (
        <orthographicCamera
          left={size.width / -2}
          right={size.width / 2}
          top={size.height / 2}
          bottom={size.height / -2}
          ref={mergeRefs([cameraRef, ref])}
          {...props}
        />
      )
    },
  ),
  'orthographicCamera',
)
