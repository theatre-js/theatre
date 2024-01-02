import type {MutableRefObject} from 'react'
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import theatre, {getStudioSync} from '@theatre/core'
import type {ISheet} from '@theatre/core'
import {types} from '@theatre/core'
import type {ITurtle} from './turtle'
import {drawTurtlePlan, makeTurtlePlan} from './turtle'

void theatre.init({studio: true})

const objConfig = {
  startingPoint: {
    x: types.number(0.5, {range: [0, 1]}),
    y: types.number(0.5, {range: [0, 1]}),
  },
  scale: types.number(1, {range: [0.1, 1000]}),
}

const TurtleRenderer: React.FC<{
  sheet: ISheet
  objKey: string
  width: number
  height: number
  programFn: (t: ITurtle) => void
}> = (props) => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

  const context = useMemo(() => {
    if (canvas) {
      return canvas.getContext('2d')!
    }
  }, [canvas])

  const dimsRef = useRef({width: props.width, height: props.height})
  dimsRef.current = {width: props.width, height: props.height}

  const obj = useMemo(() => {
    return props.sheet.object(props.objKey, objConfig)
  }, [props.sheet, props.objKey])

  useEffect(() => {
    obj.onValuesChange((v) => {
      setTransforms(v)
    })
  }, [obj])

  const [transforms, transformsRef, setTransforms] = useStateAndRef<
    typeof obj.value
  >({scale: 1, startingPoint: {x: 0.5, y: 0.5}})

  const bounds = useMemo(() => canvas?.getBoundingClientRect(), [canvas])

  useLayoutEffect(() => {
    if (!canvas) return

    const receiveWheelEvent = (event: WheelEvent) => {
      event.preventDefault()
      event.stopPropagation()
      const oldTransform = transformsRef.current
      const newTransform: typeof oldTransform = {
        ...oldTransform,
        startingPoint: {...oldTransform.startingPoint},
      }

      if (event.ctrlKey) {
        const scaleFactor = 1 - (event.deltaY / dimsRef.current.height) * 1.2
        newTransform.scale *= scaleFactor

        // const bounds = canvas.getBoundingClientRect()

        const anchorPoint = {
          x: (event.clientX - bounds!.left) / dimsRef.current.width,
          y: (event.clientY - bounds!.top) / dimsRef.current.height,
        }

        newTransform.startingPoint.x =
          anchorPoint.x -
          (anchorPoint.x - newTransform.startingPoint.x) * scaleFactor

        newTransform.startingPoint.y =
          anchorPoint.y -
          (anchorPoint.y - newTransform.startingPoint.y) * scaleFactor
      } else {
        newTransform.startingPoint.x =
          oldTransform.startingPoint.x - event.deltaX / dimsRef.current.width
        newTransform.startingPoint.y =
          oldTransform.startingPoint.y - event.deltaY / dimsRef.current.height
      }
      const studio = getStudioSync()!
      studio.transaction((api) => {
        api.set(obj.props, newTransform)
      })
      // setTransforms(newTransform)
    }

    const listenerOptions = {
      capture: true,
      passive: false,
    }
    canvas.addEventListener('wheel', receiveWheelEvent, listenerOptions)

    return () => {
      canvas.removeEventListener('wheel', receiveWheelEvent, listenerOptions)
    }
  }, [canvas])

  const plan = useMemo(() => makeTurtlePlan(props.programFn), [props.programFn])

  useEffect(() => {
    if (!context) return

    drawTurtlePlan(
      plan,
      context,
      {
        width: props.width,
        height: props.height,
        scale: transforms.scale,
        startFrom: {
          x: transforms.startingPoint.x * props.width,
          y: transforms.startingPoint.y * props.height,
        },
      },
      1,
    )
  }, [props.width, props.height, plan, context, transforms])

  return (
    <canvas width={props.width} height={props.height} ref={setCanvas}></canvas>
  )
}

function useStateAndRef<S>(
  initial: S,
): [S, MutableRefObject<S>, (s: S) => void] {
  const [state, setState] = useState(initial)
  const stateRef = useRef(state)
  const set = useCallback((s: S) => {
    stateRef.current = s
    setState(s)
  }, [])

  return [state, stateRef, set]
}

export default TurtleRenderer
