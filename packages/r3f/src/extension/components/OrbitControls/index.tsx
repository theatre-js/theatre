import type {EventManager, ReactThreeFiber} from '@react-three/fiber'
import {useFrame, useThree} from '@react-three/fiber'
import * as React from 'react'
import type {Camera, Event} from 'three'
import {OrbitControlsImpl} from './OrbitControlsImpl'

export type OrbitControlsChangeEvent = Event & {
  target: EventTarget & {object: Camera}
}

export type OrbitControlsProps = Omit<
  ReactThreeFiber.Overwrite<
    ReactThreeFiber.Object3DNode<OrbitControlsImpl, typeof OrbitControlsImpl>,
    {
      camera?: Camera
      domElement?: HTMLElement
      enableDamping?: boolean
      makeDefault?: boolean
      onChange?: (e?: OrbitControlsChangeEvent) => void
      onEnd?: (e?: Event) => void
      onStart?: (e?: Event) => void
      regress?: boolean
      target?: ReactThreeFiber.Vector3
      keyEvents?: boolean | HTMLElement
    }
  >,
  'ref'
>

export const OrbitControls = React.forwardRef<
  OrbitControlsImpl,
  OrbitControlsProps
>(
  (
    {
      makeDefault,
      camera,
      regress,
      domElement,
      enableDamping = true,
      keyEvents = false,
      onChange,
      onStart,
      onEnd,
      ...restProps
    },
    ref,
  ) => {
    const invalidate = useThree((state) => state.invalidate)
    const defaultCamera = useThree((state) => state.camera)
    const gl = useThree((state) => state.gl)
    const events = useThree(
      (state) => state.events,
    ) as EventManager<HTMLElement>
    const setEvents = useThree((state) => state.setEvents)
    const set = useThree((state) => state.set)
    const get = useThree((state) => state.get)
    const performance = useThree((state) => state.performance)
    const explCamera = (camera || defaultCamera) as
      | THREE.OrthographicCamera
      | THREE.PerspectiveCamera
    const explDomElement = (domElement ||
      events.connected ||
      gl.domElement) as HTMLElement
    const controls = React.useMemo(
      () => new OrbitControlsImpl(explCamera),
      [explCamera],
    )

    useFrame(() => {
      if (controls.enabled) controls.update()
    }, -1)

    React.useEffect(() => {
      if (keyEvents) {
        controls.connect(keyEvents === true ? explDomElement : keyEvents)
      }

      controls.connect(explDomElement)
      return () => void controls.dispose()
    }, [keyEvents, explDomElement, regress, controls, invalidate])

    React.useEffect(() => {
      const callback = (e: OrbitControlsChangeEvent) => {
        invalidate()
        if (regress) performance.regress()
        if (onChange) onChange(e)
      }

      const onStartCb = (e: Event) => {
        if (onStart) onStart(e)
      }

      const onEndCb = (e: Event) => {
        if (onEnd) onEnd(e)
      }

      controls.addEventListener('change', callback)
      controls.addEventListener('start', onStartCb)
      controls.addEventListener('end', onEndCb)

      return () => {
        controls.removeEventListener('start', onStartCb)
        controls.removeEventListener('end', onEndCb)
        controls.removeEventListener('change', callback)
      }
    }, [onChange, onStart, onEnd, controls, invalidate, setEvents])

    React.useEffect(() => {
      if (makeDefault) {
        const old = get().controls
        set({controls})
        return () => set({controls: old})
      }
    }, [makeDefault, controls])

    return (
      <primitive
        ref={ref}
        object={controls}
        enableDamping={enableDamping}
        {...restProps}
      />
    )
  },
)
export {OrbitControlsImpl}
