import React, {useEffect, useLayoutEffect} from 'react'
import styled from 'styled-components'
import {panelZIndexes} from '@theatre/studio/panels/BasePanel/common'
import ProjectsList from './ProjectsList/ProjectsList'
import {useVal} from '@theatre/react'
import getStudio from '@theatre/studio/getStudio'
import useHotspot from '@theatre/studio/uiComponents/useHotspot'
import {Atom, prism, val} from '@theatre/dataverse'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'

const headerHeight = `44px`

const Container = styled.div<{pin: boolean}>`
  ${pointerEventsAutoInNormalMode};
  background-color: transparent;
  position: absolute;
  left: 8px;
  z-index: ${panelZIndexes.outlinePanel};

  top: calc(${headerHeight} + 8px);
  height: fit-content;
  max-height: calc(100% - ${headerHeight});
  overflow-y: scroll;
  overflow-x: hidden;
  padding: 0;
  user-select: none;

  &::-webkit-scrollbar {
    display: none;
  }

  scrollbar-width: none;

  display: ${({pin}) => (pin ? 'block' : 'none')};

  &:hover {
    display: block;
  }

  // Create a small buffer on the bottom to aid selecting the bottom item in a long, scrolling list
  &::after {
    content: '';
    display: block;
    height: 20px;
  }
`

const OutlinePanel: React.FC<{}> = () => {
  const pin = useVal(getStudio().atomP.ahistoric.pinOutline) ?? true
  const show = useVal(shouldShowOutlineD)
  const active = useHotspot('left')

  useLayoutEffect(() => {
    isOutlinePanelHotspotActiveB.set(active)
  }, [active])

  // cleanup
  useEffect(() => {
    return () => {
      isOutlinePanelHoveredB.set(false)
      isOutlinePanelHotspotActiveB.set(false)
    }
  }, [])

  return (
    <Container
      pin={pin || show}
      onMouseEnter={() => {
        isOutlinePanelHoveredB.set(true)
      }}
      onMouseLeave={() => {
        isOutlinePanelHoveredB.set(false)
      }}
    >
      <ProjectsList />
    </Container>
  )
}

export default OutlinePanel

const isOutlinePanelHotspotActiveB = new Atom<boolean>(false)
const isOutlinePanelHoveredB = new Atom<boolean>(false)

export const shouldShowOutlineD = prism<boolean>(() => {
  const isHovered = val(isOutlinePanelHoveredB.prism)
  const isHotspotActive = val(isOutlinePanelHotspotActiveB.prism)

  return isHovered || isHotspotActive
})
