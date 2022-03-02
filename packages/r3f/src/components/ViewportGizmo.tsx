import * as React from 'react'
import type {ThreeEvent} from '@react-three/fiber'
import {createPortal, useFrame, useThree} from '@react-three/fiber'
import type {
  Camera,
  Color,
  Group,
  Intersection,
  Raycaster,
  Texture,
} from 'three'
import {
  CanvasTexture,
  Matrix4,
  Object3D,
  PerspectiveCamera,
  Quaternion,
  Scene,
  Vector3,
} from 'three'
import {OrthographicCamera} from '@react-three/drei'
import {useCamera} from '@react-three/drei'
import {createContext, useEffect, useRef, useState} from 'react'
import type {ISheetObject} from '@theatre/core'
import type {cameraSheetObjectType} from '../store'

type GizmoHelperContext = {
  tweenCamera: (direction: Vector3) => void
  raycast: (raycaster: Raycaster, intersects: Intersection[]) => void
}

const Context = createContext<GizmoHelperContext>({} as GizmoHelperContext)

export const useGizmoContext = () => {
  return React.useContext<GizmoHelperContext>(Context)
}

const turnRate = 2 * Math.PI // turn rate in angles per second
const dummy = new Object3D()
const matrix = new Matrix4()
const [q1, q2] = [new Quaternion(), new Quaternion()]
const targetPosition = new Vector3()

type AxisProps = {
  color: string
  rotation: [number, number, number]
  scale?: [number, number, number]
}

type AxisHeadProps = JSX.IntrinsicElements['sprite'] & {
  fillColor: string
  label?: string
  labelColor: string
  disabled?: boolean
}

type ViewportGizmoSceneProps = JSX.IntrinsicElements['group'] & {
  axisScale?: [number, number, number]
  labels?: [string, string, string]
  labelColor?: string
  disabled?: boolean
}

function Axis({scale = [0.8, 0.05, 0.05], color, rotation}: AxisProps) {
  return (
    <group rotation={rotation}>
      <mesh position={[0.4, 0, 0]}>
        <boxGeometry args={scale} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  )
}

function AxisHead({
  disabled,
  fillColor,
  label,
  labelColor,
  ...props
}: AxisHeadProps) {
  const [active, setActive] = React.useState(false)
  const gl = useThree((state) => state.gl)
  const texture = React.useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64

    const context = canvas.getContext('2d')!
    context.beginPath()
    context.arc(32, 32, 16, 0, 2 * Math.PI)
    context.closePath()
    context.fillStyle = fillColor
    context.fill()

    if (label) {
      context.font = '18px Inter var, Arial, sans-serif'
      context.textAlign = 'center'
      context.fillStyle = active ? '#fff' : '#000'
      context.fillText(label, 32, 39)
    }
    return new CanvasTexture(canvas)
  }, [fillColor, label, active])

  const scale = 1
  const handlePointerOver = (e: Event) => {
    e.stopPropagation()
    setActive(true)
  }
  const handlePointerOut = (e: Event) => {
    e.stopPropagation()
    setActive(false)
  }
  return (
    <sprite
      scale={scale}
      onPointerOver={!disabled ? handlePointerOver : undefined}
      onPointerOut={!disabled ? handlePointerOut : undefined}
      {...props}
    >
      <spriteMaterial
        map={texture}
        map-anisotropy={gl.capabilities.getMaxAnisotropy() || 1}
        alphaTest={0.3}
        opacity={label ? 1 : 0.75}
        toneMapped={false}
      />
    </sprite>
  )
}

export const ViewportGizmoScene = ({
  disabled,
  axisScale,
  labels = ['X', 'Y', 'Z'],
  labelColor = '#000',
  ...props
}: ViewportGizmoSceneProps) => {
  const [colorX, colorY, colorZ] = ['#B90808', '#40AA6A', '#0879B9']
  const {tweenCamera, raycast} = useGizmoContext()
  const axisHeadProps = {
    disabled,
    labelColor,
    raycast,
    onClick: !disabled
      ? (e: ThreeEvent<MouseEvent>) => {
          tweenCamera(e.object.position)
          e.stopPropagation()
        }
      : undefined,
  }
  return (
    <group scale={40} {...props}>
      <Axis color={colorX} rotation={[0, 0, 0]} scale={axisScale} />
      <Axis color={colorY} rotation={[0, 0, Math.PI / 2]} scale={axisScale} />
      <Axis color={colorZ} rotation={[0, -Math.PI / 2, 0]} scale={axisScale} />

      <AxisHead
        fillColor={colorX}
        position={[1, 0, 0]}
        label={labels[0]}
        {...axisHeadProps}
      />
      <AxisHead
        fillColor={colorY}
        position={[0, 1, 0]}
        label={labels[1]}
        {...axisHeadProps}
      />
      <AxisHead
        fillColor={colorZ}
        position={[0, 0, 1]}
        label={labels[2]}
        {...axisHeadProps}
      />
      <AxisHead fillColor={colorX} position={[-1, 0, 0]} {...axisHeadProps} />
      <AxisHead fillColor={colorY} position={[0, -1, 0]} {...axisHeadProps} />
      <AxisHead fillColor={colorZ} position={[0, 0, -1]} {...axisHeadProps} />

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
    </group>
  )
}

type SimpleVector = {
  x: number
  y: number
  z: number
}

export type ViewportGizmoProps = JSX.IntrinsicElements['group'] & {
  alignment?: 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left'
  margin?: [number, number]
  renderPriority?: number
  temporarilySetValue: ({
    position,
    up,
    target,
  }: {
    position: SimpleVector
    up: SimpleVector
    target: SimpleVector
  }) => void
  permanentlySetValue: ({
    position,
    up,
    target,
  }: {
    position: SimpleVector
    up: SimpleVector
    target: SimpleVector
  }) => void
  cameraSheetObject: ISheetObject<typeof cameraSheetObjectType>
}

export const ViewportGizmo = ({
  alignment = 'top-right',
  margin = [80, 80],
  renderPriority = 0,
  cameraSheetObject,
  temporarilySetValue,
  permanentlySetValue,
}: ViewportGizmoProps): any => {
  const size = useThree(({size}) => size)
  const [cameraProxy] = useState(() => new PerspectiveCamera())
  const gl = useThree(({gl}) => gl)
  const scene = useThree(({scene}) => scene)
  const invalidate = useThree(({invalidate}) => invalidate)

  const backgroundRef = React.useRef<null | Color | Texture>()
  const gizmoRef = React.useRef<Group>()
  const virtualCam = React.useRef<Camera>(null!)
  const [virtualScene] = React.useState(() => new Scene())

  const animating = React.useRef(false)
  const radius = React.useRef(0)
  const focusPoint = React.useRef(new Vector3(0, 0, 0))

  const isFirstFrame = useRef(true)

  const tweenCamera = (direction: Vector3) => {
    animating.current = true
    isFirstFrame.current = true

    focusPoint.current.set(
      cameraSheetObject.value.transform.target.x,
      cameraSheetObject.value.transform.target.y,
      cameraSheetObject.value.transform.target.z,
    )
    radius.current = cameraProxy.position.distanceTo(focusPoint.current)

    dummy.position.copy(focusPoint.current)

    // Rotate from current camera orientation
    q1.copy(cameraProxy.quaternion)

    // To new current camera orientation
    targetPosition
      .copy(direction)
      .multiplyScalar(radius.current)
      .add(focusPoint.current)
    dummy.lookAt(targetPosition)
    q2.copy(dummy.quaternion)

    invalidate()
  }

  const animateStep = (delta: number) => {
    if (!animating.current) return

    if (q1.angleTo(q2) < 0.01) {
      animating.current = false

      permanentlySetValue({
        position: {
          x: targetPosition.x,
          y: targetPosition.y,
          z: targetPosition.z,
        },
        up: {
          x: 0,
          y: 1,
          z: 0,
        },
        target: {
          x: focusPoint.current.x,
          y: focusPoint.current.y,
          z: focusPoint.current.z,
        },
      })
      return
    }

    const step = delta * turnRate

    // animate position by doing a slerp and then scaling the position on the unit sphere
    q1.rotateTowards(q2, step)
    // animate orientation
    cameraProxy.position
      .set(0, 0, 1)
      .applyQuaternion(q1)
      .multiplyScalar(radius.current)
      .add(focusPoint.current)
    cameraProxy.up.set(0, 1, 0).applyQuaternion(q1).normalize()
    cameraProxy.quaternion.copy(q1)

    temporarilySetValue({
      position: {
        x: cameraProxy.position.x,
        y: cameraProxy.position.y,
        z: cameraProxy.position.z,
      },
      up: {
        x: cameraProxy.up.x,
        y: cameraProxy.up.y,
        z: cameraProxy.up.z,
      },
      target: {
        x: focusPoint.current.x,
        y: focusPoint.current.y,
        z: focusPoint.current.z,
      },
    })

    isFirstFrame.current = false
    invalidate()
  }

  React.useEffect(() => {
    if (scene.background) {
      //Interchange the actual scene background with the virtual scene
      backgroundRef.current = scene.background
      scene.background = null
      virtualScene.background = backgroundRef.current
    }

    return () => {
      // reset on unmount
      if (backgroundRef.current) {
        scene.background = backgroundRef.current
      }
    }
  }, [])

  useEffect(() => {
    cameraSheetObject.onValuesChange((values) => {
      // Sync camera proxy with theatre props
      cameraProxy.position.set(
        values.transform.position.x,
        values.transform.position.y,
        values.transform.position.z,
      )
      cameraProxy.up.set(
        values.transform.up.x,
        values.transform.up.y,
        values.transform.up.z,
      )
      cameraProxy.lookAt(
        values.transform.target.x,
        values.transform.target.y,
        values.transform.target.z,
      )
      // Sync gizmo with main camera orientation
      matrix.copy(cameraProxy.matrix).invert()
      gizmoRef.current?.quaternion.setFromRotationMatrix(matrix)
    })
  }, [cameraSheetObject])

  useFrame((_, delta) => {
    if (virtualCam.current && gizmoRef.current) {
      animateStep(isFirstFrame.current ? 0.016 : delta)
      gl.autoClear = false
      gl.clearDepth()
      gl.render(virtualScene, virtualCam.current)
    }
  }, renderPriority)

  const gizmoHelperContext = {
    tweenCamera,
    raycast: useCamera(virtualCam),
  }

  // Position gizmo component within scene
  const [marginX, marginY] = margin
  const x = alignment.endsWith('-left')
    ? -size.width / 2 + marginX
    : size.width / 2 - marginX
  const y = alignment.startsWith('top-')
    ? size.height / 2 - marginY
    : -size.height / 2 + marginY
  return createPortal(
    <Context.Provider value={gizmoHelperContext}>
      <OrthographicCamera
        ref={virtualCam}
        makeDefault={false}
        position={[0, 0, 200]}
      />
      <group ref={gizmoRef} position={[x, y, 0]}>
        <ViewportGizmoScene />
      </group>
    </Context.Provider>,
    virtualScene,
  )
}
