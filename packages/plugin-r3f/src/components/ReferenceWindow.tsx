import type {VFC} from 'react'
import React, {useEffect, useLayoutEffect, useRef} from 'react'
import {useEditorStore} from '../store'
import shallow from 'zustand/shallow'
import type {WebGLRenderer} from 'three'
import useMeasure from 'react-use-measure'
import styled from 'styled-components'

interface ReferenceWindowProps {
  height: number
}

const Container = styled.div`
  box-shadow: 0 25px 50px -12px gray;
  overflow: hidden;
  border-radius: 0.25rem;
`

const ReferenceWindow: VFC<ReferenceWindowProps> = ({height}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [gl] = useEditorStore((state) => [state.gl], shallow)
  const [ref, bounds] = useMeasure()

  useLayoutEffect(() => {
    if (gl) {
      ref(gl?.domElement)
    }
  }, [gl, ref])

  useEffect(() => {
    let animationHandle: number
    const draw = (gl: WebGLRenderer) => () => {
      animationHandle = requestAnimationFrame(draw(gl))

      if (!gl.domElement) {
        return
      }

      const width = (gl.domElement.width / gl.domElement.height) * height

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
  }, [gl, height])

  return gl?.domElement ? (
    <Container>
      <canvas
        ref={canvasRef}
        width={
          ((bounds.width || gl.domElement.width) /
            (bounds.height || gl.domElement.height)) *
          height
        }
        height={height}
      />
    </Container>
  ) : null
}

export default ReferenceWindow
