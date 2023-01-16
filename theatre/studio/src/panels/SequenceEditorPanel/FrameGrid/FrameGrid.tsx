import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {$FixMe} from '@theatre/shared/utils/types'
import type {Pointer} from '@theatre/dataverse'
import {prism, val} from '@theatre/dataverse'
import React, {useLayoutEffect, useMemo, useRef, useState} from 'react'
import styled from 'styled-components'
import createGrid from './createGrid'
import getStudio from '@theatre/studio/getStudio'

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  pointer-events: none;
`

const TheCanvas = styled.canvas`
  position: relative;
  left: 0;
`

/**
 * from https://github.com/jonobr1/two.js/blob/758672c280278da2980b57e42ecb96eab4fe7a95/src/utils/get-ratio.js#L20
 */
const getBackingStoreRatio = (ctx: CanvasRenderingContext2D): number => {
  const _ctx = ctx as $FixMe
  return (
    _ctx.webkitBackingStorePixelRatio ||
    _ctx.mozBackingStorePixelRatio ||
    _ctx.msBackingStorePixelRatio ||
    _ctx.oBackingStorePixelRatio ||
    _ctx.backingStorePixelRatio ||
    1
  )
}

const getDevicePixelRatio = () => window.devicePixelRatio || 1

const getRatio = (ctx: CanvasRenderingContext2D) => {
  return getDevicePixelRatio() / getBackingStoreRatio(ctx)
}

const FrameGrid: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
  width: number
  height: number
}> = ({layoutP, width, height}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvas, canvasRef] = useState<HTMLCanvasElement | null>(null)

  const {ctx, ratio} = useMemo(() => {
    if (!canvas) return {}
    const ctx = canvas.getContext('2d')!
    const ratio = getRatio(ctx)

    return {ctx, ratio}
  }, [canvas])

  useLayoutEffect(() => {
    if (!ctx) return

    canvas!.width = width * ratio!
    canvas!.height = height * ratio!

    const untap = prism(() => {
      const sequence = val(layoutP.sheet).getSequence()
      return {
        ctx,
        clippedSpaceRange: val(layoutP.clippedSpace.range),
        clippedSpaceWidth: val(layoutP.clippedSpace.width),
        unitSpaceToClippedSpace: val(layoutP.clippedSpace.fromUnitSpace),
        height,
        leftPadding: val(layoutP.scaledSpace.leftPadding),
        fps: sequence.subUnitsPerUnit,
        snapToGrid: (n: number) => sequence.closestGridPosition(n),
      }
    }).onChange(
      getStudio().ticker,
      (p) => {
        ctx.save()
        ctx.scale(ratio!, ratio!)
        drawGrid(p)
        ctx.restore()
      },
      true,
    )

    return () => {
      untap()
    }
  }, [ctx, width, height, layoutP])

  return (
    <Container ref={containerRef} style={{width: width + 'px'}}>
      <TheCanvas
        ref={canvasRef}
        style={{
          width: width + 'px',
          height: height + 'px',
        }}
      />
    </Container>
  )
}

export default FrameGrid

function drawGrid(
  opts: {
    clippedSpaceWidth: number
    height: number
    ctx: CanvasRenderingContext2D
    leftPadding: number
    unitSpaceToClippedSpace: SequenceEditorPanelLayout['clippedSpace']['fromUnitSpace']
    snapToGrid: (posInUnitSpace: number) => number
  } & Parameters<typeof createGrid>[0],
) {
  const {clippedSpaceWidth, height, ctx, unitSpaceToClippedSpace, snapToGrid} =
    opts

  ctx.clearRect(0, 0, clippedSpaceWidth, height)

  createGrid(opts, (_posInUnitSpace, isFullSecond) => {
    const posInUnitSpace = snapToGrid(_posInUnitSpace)
    const posInClippedSpace = Math.floor(
      unitSpaceToClippedSpace(posInUnitSpace),
    )

    ctx.strokeStyle = isFullSecond
      ? 'rgba(225, 225, 225, 0.04)'
      : 'rgba(255, 255, 255, 0.01)'

    ctx.beginPath()
    ctx.moveTo(posInClippedSpace, 0)
    ctx.lineTo(posInClippedSpace, height)
    ctx.stroke()
    ctx.closePath()
  })
}
