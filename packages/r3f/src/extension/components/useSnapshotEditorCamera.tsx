import {PerspectiveCamera} from '@react-three/drei'
import {OrbitControls} from './OrbitControls'
import type {OrbitControlsImpl} from './OrbitControls'
import type {MutableRefObject} from 'react'
import {useLayoutEffect, useRef} from 'react'
import React from 'react'
import useRefAndState from './useRefAndState'
import type {IScrub} from '@theatre/core'
import studio from '@theatre/studio'
import type {PerspectiveCamera as PerspectiveCameraImpl} from 'three'
import type {ISheet} from '@theatre/core'
import {types} from '@theatre/core'
import type {ISheetObject} from '@theatre/core'
import {useThree} from '@react-three/fiber'
import type {$IntentionalAny} from '../../types'

const camConf = {
  transform: {
    position: {
      x: types.number(10),
      y: types.number(10),
      z: types.number(0),
    },
    target: {
      x: types.number(0),
      y: types.number(0),
      z: types.number(0),
    },
  },
  lens: {
    zoom: types.number(1, {range: [0.0001, 10]}),
    fov: types.number(50, {range: [1, 1000]}),
    near: types.number(0.1, {range: [0, Infinity]}),
    far: types.number(2000, {range: [0, Infinity]}),
    focus: types.number(10, {range: [0, Infinity]}),
    filmGauge: types.number(35, {range: [0, Infinity]}),
    filmOffset: types.number(0, {range: [0, Infinity]}),
  },
}

export default function useSnapshotEditorCamera(
  snapshotEditorSheet: ISheet,
  paneId: string,
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

  const objRef = useRef<ISheetObject<typeof camConf> | null>(null)

  useLayoutEffect(() => {
    if (!objRef.current) {
      objRef.current = snapshotEditorSheet.object(
        `Editor Camera ${paneId}`,
        camConf,
      )
    }
  }, [paneId])

  usePassValuesFromTheatreToCamera(cam, orbitControls, objRef)
  usePassValuesFromOrbitControlsToTheatre(cam, orbitControls, objRef)

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

/**
 * This debounce does delay the placement of a keyframe, so you
 * need to be wary of it being too long and causing an issue like
 * the following:
 *
 * 1. user moves playhead t 0
 * 2. user changes orbit
 * 3. user moves playead to 10
 * 4. user changes orbit again
 *
 * User expects a keyframe on t0 and t10
 */
const COMMIT_DEBOUNCE_MS = 200

function usePassValuesFromOrbitControlsToTheatre(
  cam: PerspectiveCameraImpl | undefined,
  orbitControls: OrbitControlsImpl | null,
  objRef: MutableRefObject<ISheetObject<typeof camConf> | null>,
) {
  useLayoutEffect(() => {
    if (!cam || orbitControls == null) return

    let currentScrub:
      | undefined
      | {
          /** "debounce" like timer for making commits to the orbit's changes */
          scheduledCommit?: {
            timer: $IntentionalAny
            // Future, might be possible to remember the position we need to apply this scrub to (when the last 'end' event was received)
            // position: number
          }
          scrub: IScrub
        }

    const scheduleCommit = () => {
      if (currentScrub) {
        clearTimeout(currentScrub.scheduledCommit?.timer)
        const reference = currentScrub // capture current scrub to make sure currentScrub isn't out of date
        currentScrub.scheduledCommit = {
          timer: setTimeout(() => {
            if (reference === currentScrub) {
              currentScrub.scrub.commit()
              currentScrub = undefined
            }
          }, COMMIT_DEBOUNCE_MS),
        }
      }
    }

    const onStart = () => {
      if (currentScrub) {
        // prevent existing scheduled commit from executing during the start of a rotation or pan.
        // This currentScrub will continue being used and will be scheduled again onEnd
        clearTimeout(currentScrub.scheduledCommit?.timer)
      } else {
        // start new scrub
        currentScrub = {
          scrub: studio.scrub(),
        }
      }
    }

    const onEnd = () => {
      scheduleCommit()
    }

    const onChange = () => {
      if (!currentScrub) return

      const p = cam!.position
      const position = {x: p.x, y: p.y, z: p.z}

      const t = orbitControls!.target
      const target = {x: t.x, y: t.y, z: t.z}

      const transform = {
        position,
        target,
      }

      currentScrub.scrub.capture(({set}) => {
        set(objRef.current!.props.transform, transform)
      })
    }

    orbitControls.addEventListener('start', onStart)
    orbitControls.addEventListener('end', onEnd)
    orbitControls.addEventListener('change', onChange)

    return () => {
      orbitControls.removeEventListener('start', onStart)
      orbitControls.removeEventListener('end', onEnd)
      orbitControls.removeEventListener('change', onChange)
      if (currentScrub) {
        // defensively discard in progress changes
        currentScrub.scrub.discard()
        currentScrub = undefined
      }
    }
  }, [cam, orbitControls])
}

function usePassValuesFromTheatreToCamera(
  cam: PerspectiveCameraImpl | undefined,
  orbitControls: OrbitControlsImpl | null,
  objRef: MutableRefObject<ISheetObject<typeof camConf> | null>,
) {
  const invalidate = useThree(({invalidate}) => invalidate)

  useLayoutEffect(() => {
    if (!cam || orbitControls === null) return

    const obj = objRef.current!
    const setFromTheatre = (
      props: ISheetObject<typeof camConf>['value'],
    ): void => {
      const {position, target} = props.transform
      cam.zoom = props.lens.zoom
      cam.fov = props.lens.fov
      cam.near = props.lens.near
      cam.far = props.lens.far
      cam.focus = props.lens.focus
      cam.filmGauge = props.lens.filmGauge
      cam.filmOffset = props.lens.filmOffset
      cam.position.set(position.x, position.y, position.z)
      cam.updateProjectionMatrix()
      orbitControls.target.set(target.x, target.y, target.z)
      orbitControls.update()
      invalidate()
    }

    const unsub = obj.onValuesChange(setFromTheatre)
    setFromTheatre(obj.value)

    return unsub
  }, [cam, orbitControls, objRef, invalidate])
}
