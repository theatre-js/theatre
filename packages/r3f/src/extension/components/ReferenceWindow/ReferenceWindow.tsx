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

const Container = styled.div<{minified: boolean}>`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: auto;
  cursor: pointer;
  overflow: hidden;
  border-radius: ${({minified}) => (minified ? '2px' : '4px')};
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0, 0, 0, 0.15);
`

const Canvas = styled.canvas<{width: number; height: number}>`
  display: block;
  width: ${({width, height}) => (width > height ? 'auto' : '100%')};
  height: ${({width, height}) => (height > width ? 'auto' : '100%')};
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

interface ReferenceWindowProps {
  maxHeight: number
  maxWidth: number
}

const ReferenceWindow: VFC<ReferenceWindowProps> = ({maxHeight, maxWidth}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const minified =
    useVal(getEditorSheetObject()?.props.viewport.showReferenceWindow) ?? true

  const [gl] = useExtensionStore((state) => [state.gl], shallow)
  const [ref, {width: origWidth, height: origHeight}] = useMeasure()

  const preserveDrawingBuffer =
    gl?.getContextAttributes()?.preserveDrawingBuffer ?? false

  useLayoutEffect(() => {
    if (gl) {
      ref(gl?.domElement)
    }
  }, [gl, ref])

  const [width, height] = useMemo(() => {
    if (!gl) return [0, 0]
    const aspectRatio = origWidth / origHeight

    const width = Math.min(aspectRatio * maxHeight, maxWidth)

    const height = width / aspectRatio
    return [width, height]
  }, [gl, maxWidth, maxHeight, origWidth, origHeight])

  useEffect(() => {
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
      set(getEditorSheetObject()!.props.viewport.showReferenceWindow, !minified)
    })
  }

  return (
    <Container
      minified={!minified}
      onClick={toggleVisibility}
      style={{
        width: !minified ? 32 : preserveDrawingBuffer ? `${width}px` : 'auto',
        height: !minified ? 32 : preserveDrawingBuffer ? `${height}px` : 'auto',
      }}
    >
      {preserveDrawingBuffer ? (
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
