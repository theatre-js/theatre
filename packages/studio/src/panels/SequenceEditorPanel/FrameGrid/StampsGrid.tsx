import type {ISequencePositionFormatter} from '@theatre/core/sequences/Sequence'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {Pointer} from '@theatre/dataverse'
import {prism, val} from '@theatre/dataverse'
import {darken} from 'polished'
import React, {useLayoutEffect, useRef, useState} from 'react'
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

export const stampsGridTheme = {
  fullUnitStampColor: `#6a6a6a`,
  stampFontSize: '10px',
  get subUnitStampColor(): string {
    return darken(0.2, stampsGridTheme.fullUnitStampColor)
  },
}

const TheStamps = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  left: 0;
  overflow: hidden;
  z-index: 2;
  will-change: transform;
  pointer-events: none;
`

const FullSecondStampsContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;

  & > span {
    position: absolute;
    display: block;
    top: 9px;
    left: -10px;
    color: ${stampsGridTheme.fullUnitStampColor};
    text-align: center;
    font-size: ${stampsGridTheme.stampFontSize};
    width: 20px;

    &.full-unit {
      color: ${stampsGridTheme.fullUnitStampColor};
    }

    &.sub-unit {
      color: ${stampsGridTheme.subUnitStampColor};
    }
  }

  pointer-events: none;
`

const StampsGrid: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
  width: number
  height: number
}> = ({layoutP, width}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [fullSecondStampsContainer, fullSecondStampsContainerRef] =
    useState<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    if (!fullSecondStampsContainer) return

    return prism(() => {
      const sequence = val(layoutP.sheet).getSequence()
      return {
        fullSecondStampsContainer,
        clippedSpaceRange: val(layoutP.clippedSpace.range),
        clippedSpaceWidth: val(layoutP.clippedSpace.width),
        unitSpaceToClippedSpace: val(layoutP.clippedSpace.fromUnitSpace),
        leftPadding: val(layoutP.scaledSpace.leftPadding),
        fps: sequence.subUnitsPerUnit,
        sequencePositionFormatter: sequence.positionFormatter,
        snapToGrid: (n: number) => sequence.closestGridPosition(n),
      }
    }).onChange(getStudio().ticker, drawStamps, true)
  }, [fullSecondStampsContainer, width, layoutP])

  return (
    <Container ref={containerRef} style={{width: width + 'px'}}>
      <TheStamps style={{width: width + 'px'}}>
        <FullSecondStampsContainer ref={fullSecondStampsContainerRef} />
      </TheStamps>
    </Container>
  )
}

export default StampsGrid

function drawStamps(
  opts: {
    fullSecondStampsContainer: HTMLDivElement
    sequencePositionFormatter: ISequencePositionFormatter
    snapToGrid: (posInUnitSpace: number) => number
    unitSpaceToClippedSpace: SequenceEditorPanelLayout['clippedSpace']['fromUnitSpace']
  } & Parameters<typeof createGrid>[0],
) {
  const {
    fullSecondStampsContainer,
    sequencePositionFormatter,
    snapToGrid,
    unitSpaceToClippedSpace,
  } = opts
  let innerHTML = ''

  createGrid(opts, (_posInUnitSpace, isFullUnit) => {
    const posInUnitSpace = snapToGrid(_posInUnitSpace)
    const posInClippedSpace = unitSpaceToClippedSpace(posInUnitSpace)

    if (isFullUnit) {
      innerHTML += createStampClass(
        sequencePositionFormatter.formatFullUnitForGrid(posInUnitSpace),
        posInClippedSpace,
        'full-unit',
      )
    } else {
      innerHTML += createStampClass(
        sequencePositionFormatter.formatSubUnitForGrid(posInUnitSpace),
        posInClippedSpace,
        'sub-unit',
      )
    }
  })

  fullSecondStampsContainer.innerHTML = innerHTML
}

function createStampClass(
  pos: string,
  x: number,
  type: 'full-unit' | 'sub-unit',
) {
  return `<span class="${type}" style="transform: translate3d(${x.toFixed(
    1,
  )}px, -50%, 0);">${pos}</span>`
}
