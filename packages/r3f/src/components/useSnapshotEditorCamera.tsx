import {OrbitControls, PerspectiveCamera} from '@react-three/drei'
import type {OrbitControls as OrbitControlsImpl} from 'three-stdlib'
import type {MutableRefObject} from 'react'
import {useLayoutEffect} from 'react'
import React from 'react'
import useRefAndState from './useRefAndState'
import type {IScrub} from '@theatre/studio'
import studio from '@theatre/studio'
import type {PerspectiveCamera as PerspectiveCameraImpl} from 'three'
import type {ISheet} from '@theatre/core'
import type {ISheetObject} from '@theatre/core'
import {useThree} from '@react-three/fiber'
import type {cameraSheetObjectType} from '../store'

export default function useSnapshotEditorCamera(
  snapshotEditorSheet: ISheet,
  paneId: string,
  cameraSheetObject: ISheetObject<typeof cameraSheetObjectType>,
): [
  node: React.ReactNode,
  orbitControlsRef: MutableRefObject<OrbitControlsImpl | null>,
] {
  // OrbitControls and Cam might change later on, so we use useRefAndState()
  // instead of useRef() to catch those changes.
  const [orbitControlsRef, orbitControls] =
    useRefAndState<OrbitControlsImpl | null>(null)

  const [camRef, cam] = useRefAndState<PerspectiveCameraImpl | undefined>(
    undefined,
  )

  usePassValuesFromTheatreToCamera(cam, orbitControls, cameraSheetObject)
  usePassValuesFromOrbitControlsToTheatre(cam, orbitControls, cameraSheetObject)

  const node = (
    <>
      <PerspectiveCamera makeDefault ref={camRef} position={[0, 102, 0]} />
      <OrbitControls
        makeDefault
        ref={orbitControlsRef}
        camera={cam}
        enableDamping={false}
      />
    </>
  )

  return [node, orbitControlsRef]
}

function usePassValuesFromOrbitControlsToTheatre(
  cam: PerspectiveCameraImpl | undefined,
  orbitControls: OrbitControlsImpl | null,
  cameraSheetObject: ISheetObject<typeof cameraSheetObjectType>,
) {
  useLayoutEffect(() => {
    if (!cam || orbitControls == null) return

    let currentScrub: undefined | IScrub

    let started = false

    const onStart = () => {
      started = true
      if (!currentScrub) {
        currentScrub = studio.scrub()
      }
    }
    const onEnd = () => {
      if (currentScrub) {
        currentScrub.commit()
        currentScrub = undefined
      }
      started = false
    }

    const onChange = () => {
      if (!started) return

      const p = cam!.position
      const position = {x: p.x, y: p.y, z: p.z}

      const u = cam!.up
      const up = {x: u.x, y: u.y, z: u.z}

      const t = orbitControls!.target
      const target = {x: t.x, y: t.y, z: t.z}

      const transform = {
        position,
        up,
        target,
      }

      currentScrub!.capture(({set}) => {
        set(cameraSheetObject.props.transform, transform)
      })
    }

    orbitControls.addEventListener('start', onStart)
    orbitControls.addEventListener('end', onEnd)
    orbitControls.addEventListener('change', onChange)

    return () => {
      orbitControls.removeEventListener('start', onStart)
      orbitControls.removeEventListener('end', onEnd)
      orbitControls.removeEventListener('change', onChange)
    }
  }, [cam, orbitControls])
}

function usePassValuesFromTheatreToCamera(
  cam: PerspectiveCameraImpl | undefined,
  orbitControls: OrbitControlsImpl | null,
  cameraSheetObject: ISheetObject<typeof cameraSheetObjectType>,
) {
  const invalidate = useThree(({invalidate}) => invalidate)

  useLayoutEffect(() => {
    if (!cam || orbitControls === null) return

    const setFromTheatre = (
      props: ISheetObject<typeof cameraSheetObjectType>['value'],
    ): void => {
      const {position, up, target} = props.transform
      cam.zoom = props.lens.zoom
      cam.fov = props.lens.fov
      cam.near = props.lens.near
      cam.far = props.lens.far
      cam.focus = props.lens.focus
      cam.filmGauge = props.lens.filmGauge
      cam.filmOffset = props.lens.filmOffset
      cam.position.set(position.x, position.y, position.z)
      cam.up.set(up.x, up.y, up.z)
      cam.updateProjectionMatrix()
      orbitControls.target.set(target.x, target.y, target.z)
      orbitControls.update()
      invalidate()
    }

    const unsub = cameraSheetObject.onValuesChange(setFromTheatre)
    setFromTheatre(cameraSheetObject.value)

    return unsub
  }, [cam, orbitControls, invalidate])
}
