import {getOutlineSelection} from '@theatre/studio/selectors'
import {usePrism, useVal} from '@theatre/react'
import React, {useEffect, useState} from 'react'
import styled from 'styled-components'
import {isProject, isSheetObject} from '@theatre/shared/instanceTypes'
import {
  panelZIndexes,
  TitleBar_Piece,
  TitleBar_Punctuation,
} from '@theatre/studio/panels/BasePanel/common'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import ObjectDetails from './ObjectDetails'
import ProjectDetails from './ProjectDetails'
import getStudio from '@theatre/studio/getStudio'

const Container = styled.div<{pin: boolean}>`
  background-color: transparent;
  pointer-events: none;
  position: fixed;
  right: 0;
  top: 50px;
  bottom: 0px;
  width: 260px;
  z-index: ${panelZIndexes.propsPanel};

  display: ${({pin}) => (pin ? 'block' : 'none')};
`

const Title = styled.div`
  margin: 0 10px;
  color: #ffffffc2;
  font-weight: 500;
  font-size: 10px;
  user-select: none;
  ${pointerEventsAutoInNormalMode};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const headerHeight = `32px`

const Header = styled.div`
  height: ${headerHeight};
  display: flex;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;

  &:after {
    position: absolute;
    inset: 1px 0px;
    display: block;
    content: ' ';
    pointer-events: none;
    z-index: -1;
    background-color: #262c2dd1;
    /* border-radius: 2px 0 0 2px; */
  }
`

const Body = styled.div`
  ${pointerEventsAutoInNormalMode};
  position: absolute;
  top: ${headerHeight};
  left: 0;
  right: 0;
  height: auto;
  max-height: calc(100% - ${headerHeight});
  overflow-y: scroll;
  &::-webkit-scrollbar {
    display: none;
  }

  scrollbar-width: none;
  padding: 0;
  user-select: none;
`

const DetailPanel: React.FC<{}> = (props) => {
  const pin = useVal(getStudio().atomP.ahistoric.pinDetails)

  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    const listener = (e: MouseEvent) => {
      const threshold = hovering ? 200 : 50
      if (e.x > window.innerWidth - threshold) {
        setHovering(true)
      } else {
        setHovering(false)
      }
    }
    document.addEventListener('mousemove', listener)

    return () => document.removeEventListener('mousemove', listener)
  }, [hovering])

  console.log(hovering)

  return usePrism(() => {
    const selection = getOutlineSelection()

    const obj = selection.find(isSheetObject)
    if (obj) {
      return (
        <Container pin={pin || hovering}>
          <Header>
            <Title
              title={`${obj.sheet.address.sheetId}: ${obj.sheet.address.sheetInstanceId} > ${obj.address.objectKey}`}
            >
              <TitleBar_Piece>{obj.sheet.address.sheetId} </TitleBar_Piece>

              <TitleBar_Punctuation>{':'}&nbsp;</TitleBar_Punctuation>
              <TitleBar_Piece>
                {obj.sheet.address.sheetInstanceId}{' '}
              </TitleBar_Piece>

              <TitleBar_Punctuation>&nbsp;{'>'}&nbsp;</TitleBar_Punctuation>
              <TitleBar_Piece>{obj.address.objectKey}</TitleBar_Piece>
            </Title>
          </Header>
          <Body>
            <ObjectDetails objects={[obj]} />
          </Body>
        </Container>
      )
    }
    const project = selection.find(isProject)
    if (project) {
      return (
        <Container pin={pin || hovering}>
          <Header>
            <Title title={`${project.address.projectId}`}>
              <TitleBar_Piece>{project.address.projectId} </TitleBar_Piece>
            </Title>
          </Header>
          <Body>
            <ProjectDetails projects={[project]} />
          </Body>
        </Container>
      )
    }

    return <></>
  }, [pin, hovering])
}

export default DetailPanel
