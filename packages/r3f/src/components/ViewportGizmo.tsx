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
import {useState} from 'react'
import type {ISheetObject} from '@theatre/core'

type GizmoHelperContext = {
  tweenCamera: (direction: Vector3) => void
  raycast: (raycaster: Raycaster, intersects: Intersection[]) => void
}

const Context = React.createContext<GizmoHelperContext>(
  {} as GizmoHelperContext,
)

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
  arcStyle: string
  label?: string
  labelColor: string
  axisHeadScale?: number
  disabled?: boolean
  font: string
  onClick?: (e: Event) => null
}

type GizmoViewportProps = JSX.IntrinsicElements['group'] & {
  axisColors?: [string, string, string]
  axisScale?: [number, number, number]
  labels?: [string, string, string]
  axisHeadScale?: number
  labelColor?: string
  hideNegativeAxes?: boolean
  hideAxisHeads?: boolean
  disabled?: boolean
  font?: string
  onClick?: (e: Event) => null
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
  onClick,
  font,
  disabled,
  arcStyle,
  label,
  labelColor,
  axisHeadScale = 1,
  ...props
}: AxisHeadProps) {
  const gl = useThree((state) => state.gl)
  const texture = React.useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64

    const context = canvas.getContext('2d')!
    context.beginPath()
    context.arc(32, 32, 16, 0, 2 * Math.PI)
    context.closePath()
    context.fillStyle = arcStyle
    context.fill()

    if (label) {
      context.font = font
      context.textAlign = 'center'
      context.fillStyle = labelColor
      context.fillText(label, 32, 41)
    }
    return new CanvasTexture(canvas)
  }, [arcStyle, label, labelColor, font])

  const [active, setActive] = React.useState(false)
  const scale = (label ? 1 : 0.75) * (active ? 1.2 : 1) * axisHeadScale
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
      onPointerOut={!disabled ? onClick || handlePointerOut : undefined}
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

export const GizmoViewport = ({
  hideNegativeAxes,
  hideAxisHeads,
  disabled,
  font = '18px Inter var, Arial, sans-serif',
  axisColors = ['#ff3653', '#0adb50', '#2c8fdf'],
  axisHeadScale = 1,
  axisScale,
  labels = ['X', 'Y', 'Z'],
  labelColor = '#000',
  onClick,
  ...props
}: GizmoViewportProps) => {
  const [colorX, colorY, colorZ] = axisColors
  const {tweenCamera, raycast} = useGizmoContext()
  const axisHeadProps = {
    font,
    disabled,
    labelColor,
    raycast,
    onClick,
    axisHeadScale,
    onPointerDown: !disabled
      ? (e: ThreeEvent<PointerEvent>) => {
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
        arcStyle={colorX}
        position={[1, 0, 0]}
        label={labels[0]}
        {...axisHeadProps}
      />
      <AxisHead
        arcStyle={colorY}
        position={[0, 1, 0]}
        label={labels[1]}
        {...axisHeadProps}
      />
      <AxisHead
        arcStyle={colorZ}
        position={[0, 0, 1]}
        label={labels[2]}
        {...axisHeadProps}
      />
      <AxisHead arcStyle={colorX} position={[-1, 0, 0]} {...axisHeadProps} />
      <AxisHead arcStyle={colorY} position={[0, -1, 0]} {...axisHeadProps} />
      <AxisHead arcStyle={colorZ} position={[0, 0, -1]} {...axisHeadProps} />

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
    </group>
  )
}

type ControlsProto = {update(): void; target: Vector3}

type SimpleVector = {
  x: number
  y: number
  z: number
}

export type GizmoHelperProps = JSX.IntrinsicElements['group'] & {
  alignment?: 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left'
  margin?: [number, number]
  renderPriority?: number
  onUpdate?: () => void // update controls during animation
  // TODO: in a new major state.controls should be the only means of consuming controls, the
  // onTarget prop can then be removed!
  onTarget: () => Vector3 // return the target to rotate around
  temporarilySetValue: (position: SimpleVector, target: SimpleVector) => void
  permanentlySetValue: (position: SimpleVector, target: SimpleVector) => void
  cameraSheetObject: ISheetObject<{
    transform: {
      position: {
        x: number
        y: number
        z: number
      }
      target: {
        x: number
        y: number
        z: number
      }
    }
  }>
}

export const GizmoHelper = ({
  alignment = 'bottom-right',
  margin = [80, 80],
  renderPriority = 0,
  onUpdate,
  onTarget,
}: GizmoHelperProps): any => {
  const size = useThree(({size}) => size)
  const [cameraProxy] = useState(() => new PerspectiveCamera())
  // @ts-expect-error new in @react-three/fiber@7.0.5
  const defaultControls = useThree(({controls}) => controls) as ControlsProto
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

  const tweenCamera = (direction: Vector3) => {
    animating.current = true
    focusPoint.current = onTarget()
    radius.current = cameraProxy.position.distanceTo(focusPoint.current)

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
    // cameraProxy.up.set(0, 1, 0).applyQuaternion(q1).normalize()
    cameraProxy.quaternion.copy(q1)

    if (onUpdate) onUpdate()
    else if (defaultControls) defaultControls.update()

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

  const beforeRender = () => {
    // Sync gizmo with main camera orientation
    matrix.copy(cameraProxy.matrix).invert()
    gizmoRef.current?.quaternion.setFromRotationMatrix(matrix)
  }

  useFrame((_, delta) => {
    if (virtualCam.current && gizmoRef.current) {
      animateStep(delta)
      beforeRender()
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
        <GizmoViewport />
      </group>
    </Context.Provider>,
    virtualScene,
  )
}
