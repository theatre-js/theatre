import type {VFC} from 'react'
import {useMemo} from 'react'
import React, {useEffect, useLayoutEffect, useRef} from 'react'
import shallow from 'zustand/shallow'
import type {WebGLRenderer} from 'three'
import useMeasure from 'react-use-measure'
import styled, {keyframes} from 'styled-components'
import {TiWarningOutline} from 'react-icons/ti'
import noiseImageUrl from './noise-transparent.png'
import useExtensionStore from '../../useExtensionStore'
import {useVal} from '@theatre/react'
import {getEditorSheetObject} from '../../editorStuff'
import studio from '@theatre/studio'

const Container = styled.div`
  position: relative;
  border-radius: 4px;
  pointer-events: auto;
  cursor: pointer;
  overflow: hidden;

  &.hidden {
    border-radius: 8px;
  }
`

const Canvas = styled.canvas`
  display: block;
`

const staticAnimation = keyframes`
  0% { transform: translate(0,0) }
  10% { transform: translate(-5%,-5%) }
  20% { transform: translate(-10%,5%) }
  30% { transform: translate(5%,-10%) }
  40% { transform: translate(-5%,15%) }
  50% { transform: translate(-10%,5%) }
  60% { transform: translate(15%,0) }
  70% { transform: translate(0,10%) }
  80% { transform: translate(-15%,0) }
  90% { transform: translate(10%,5%) }
  100% { transform: translate(5%,0) }
`

const Static = styled.div`
  position: relative;
  display: flex;
  width: 200px;
  height: 120px;
  padding: 18px;

  ::before {
    content: '';
    position: absolute;
    z-index: -1;
    top: -50%;
    left: -50%;
    right: -50%;
    bottom: -50%;
    background: #2f2f2f url(${noiseImageUrl}) repeat 0 0;
    animation: ${staticAnimation} 0.2s infinite;
  }
`

const Warning = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  text-align: center;
  opacity: 0.8;
`

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: red;
  pointer-events: auto;
  cursor: pointer;
`

interface ReferenceWindowProps {
  maxHeight: number
  maxWidth: number
}

const ReferenceWindow: VFC<ReferenceWindowProps> = ({maxHeight, maxWidth}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const visible =
    useVal(getEditorSheetObject()?.props.viewport.showReferenceWindow) ?? true

  const [gl] = useExtensionStore((state) => [state.gl], shallow)
  const [ref, bounds] = useMeasure()

  const preserveDrawingBuffer =
    (
      gl?.domElement.getContext('webgl') ?? gl?.domElement.getContext('webgl2')
    )?.getContextAttributes()?.preserveDrawingBuffer ?? false

  useLayoutEffect(() => {
    if (gl) {
      ref(gl?.domElement)
    }
  }, [gl, ref])

  const [width, height] = useMemo(() => {
    if (!gl) return [0, 0]
    const aspectRatio = gl.domElement.width / gl.domElement.height

    const width = Math.min(aspectRatio * maxHeight, maxWidth)

    const height = width / aspectRatio
    return [width, height]
  }, [gl, maxWidth, maxHeight])

  useEffect(() => {
    // if (!visible) return
    let animationHandle: number
    const draw = (gl: WebGLRenderer) => () => {
      animationHandle = requestAnimationFrame(draw(gl))

      if (!gl.domElement || !preserveDrawingBuffer) {
        cancelAnimationFrame(animationHandle)
        return
      }

      const ctx = canvasRef.current!.getContext('2d')!

      // https://stackoverflow.com/questions/17861447/html5-canvas-drawimage-how-to-apply-antialiasing
      ctx.imageSmoothingQuality = 'high'

      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, width, height)

      ctx.drawImage(gl.domElement, 0, 0, width, height)
    }

    if (gl) {
      draw(gl)()
    }

    return () => {
      cancelAnimationFrame(animationHandle)
    }
  }, [gl, width, height, preserveDrawingBuffer])

  const toggleVisibility = () => {
    studio.transaction(({set}) => {
      set(getEditorSheetObject()!.props.viewport.showReferenceWindow, !visible)
    })
  }

  // if (!visible) {
  //   return <Dot onClick={toggleVisibility} />
  // }

  return (
    <Container
      onClick={toggleVisibility}
      className={`${visible ? 'visible' : 'hidden'}`}
      style={{
        width: (visible ? width : 12) + 'px',
        height: (visible ? height : 12) + 'px',
      }}
    >
      {gl?.domElement && preserveDrawingBuffer ? (
        <Canvas ref={canvasRef} width={width} height={height} />
      ) : (
        <Static>
          <Warning>
            <TiWarningOutline size="3em" />
            <code>
              Please set <pre>{`gl={{ preserveDrawingBuffer: true }}`}</pre> on
              the r3f Canvas for the reference window to work.
            </code>
          </Warning>
        </Static>
      )}
    </Container>
  )
}

export default ReferenceWindow
