import type { VFC} from 'react';
import React, {useEffect, useLayoutEffect, useRef} from 'react'
import {useEditorStore} from '../../store'
import shallow from 'zustand/shallow'
import type {WebGLRenderer} from 'three'
import useMeasure from 'react-use-measure'
import styled, {keyframes} from 'styled-components'
import {TiWarningOutline} from 'react-icons/ti'
// @ts-ignore
import staticImgUrl from './noise-transparent.png'

const Container = styled.div`
  position: relative;
  width: fit-content;
  height: fit-content;
  border-radius: 4px;
  overflow: hidden;
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
    background: #2f2f2f url(${staticImgUrl}) repeat 0 0;
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

interface ReferenceWindowProps {
  height: number
}

const ReferenceWindow: VFC<ReferenceWindowProps> = ({height}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [gl] = useEditorStore((state) => [state.gl], shallow)
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

  useEffect(() => {
    let animationHandle: number
    const draw = (gl: WebGLRenderer) => () => {
      animationHandle = requestAnimationFrame(draw(gl))

      if (!gl.domElement || !preserveDrawingBuffer) {
        cancelAnimationFrame(animationHandle)
        return
      }

      const width = (gl.domElement.width / gl.domElement.height) * height

      const ctx = canvasRef.current!.getContext('2d')!

      console.log(gl.domElement.getContext('webgl2')!.getContextAttributes())

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
  }, [gl, height, preserveDrawingBuffer])

  return (
    <Container>
      {gl?.domElement && preserveDrawingBuffer ? (
        <Canvas
          ref={canvasRef}
          width={
            ((bounds.width || gl.domElement.width) /
              (bounds.height || gl.domElement.height)) *
            height
          }
          height={height}
        />
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
