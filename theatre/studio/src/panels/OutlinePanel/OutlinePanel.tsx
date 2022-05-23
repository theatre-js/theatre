import React, {useEffect, useState} from 'react'
import styled from 'styled-components'
import {panelZIndexes} from '@theatre/studio/panels/BasePanel/common'
import ProjectsList from './ProjectsList/ProjectsList'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import ToolbarIconButton from '@theatre/studio/uiComponents/toolbar/ToolbarIconButton'
import {VscListTree} from 'react-icons/all'
import {usePrism, useVal} from '@theatre/react'
import getStudio from '@theatre/studio/getStudio'
import {val} from '@theatre/dataverse'
import useTooltip from '@theatre/studio/uiComponents/Popover/useTooltip'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import BasicTooltip from '@theatre/studio/uiComponents/Popover/BasicTooltip'
import ErrorTooltip from '@theatre/studio/uiComponents/Popover/ErrorTooltip'

const Container = styled.div`
  background-color: transparent;
  pointer-events: none;
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 0px;
  right: 0;
  z-index: ${panelZIndexes.outlinePanel};
`

const TriggerContainer = styled.div`
  margin-left: 12px;
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`

const Content = styled.div<{pin: boolean}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: ${({pin}) => (pin ? 'block' : 'none')};
  pointer-events: none;

  ${Container}:hover & {
    display: block;
  }
`

const headerHeight = `32px`

const TriggerButton = styled(ToolbarIconButton)`
  ${Container}:hover & {
    background-color: rgba(36, 38, 42, 0.95);
    &:after {
      border-color: rgba(255, 255, 255, 0.22);
    }
    color: white;
  }
`

const Title = styled.div`
  margin: 0 12px;
  color: #ffffffc2;
  font-weight: 500;
  font-size: 10px;
  user-select: none;
  position: relative;
  display: none;
  background-color: rgba(60, 60, 60, 0.2);
  height: 24px;
  ${Container}:hover & {
    display: block;
  }

  &:after {
    position: absolute;
    inset: 4px 0px;
    display: block;
    content: ' ';
    pointer-events: none;
    z-index: -1;
    background-color: #69777947;
    border-radius: 0 2px 2px 0;
  }
`

const Body = styled.div`
  ${pointerEventsAutoInNormalMode};
  position: absolute;
  top: ${headerHeight};
  left: 8px;
  height: auto;
  max-height: calc(100% - ${headerHeight});
  overflow-y: scroll;
  overflow-x: hidden;
  padding: 0;
  user-select: none;
  &::-webkit-scrollbar {
    display: none;
  }

  scrollbar-width: none;
`

const NumberOfConflictsIndicator = styled.div`
  color: white;
  width: 14px;
  height: 14px;
  background: #d00;
  border-radius: 4px;
  text-align: center;
  line-height: 14px;
  font-weight: 600;
  font-size: 8px;
  position: relative;
  left: -6px;
  top: -11px;
  margin-right: -14px;
  box-shadow: 0 4px 6px -4px #00000059;
`

const OutlinePanel: React.FC<{}> = (props) => {
  const conflicts = usePrism(() => {
    const ephemeralStateOfAllProjects = val(
      getStudio().atomP.ephemeral.coreByProject,
    )
    return Object.entries(ephemeralStateOfAllProjects)
      .map(([projectId, state]) => ({projectId, state}))
      .filter(
        ({state}) =>
          state.loadingState.type === 'browserStateIsNotBasedOnDiskState',
      )
  }, [])

  const pin = useVal(getStudio().atomP.ahistoric.pinOutline)

  const [triggerTooltip, triggerButtonRef] = useTooltip(
    {enabled: conflicts.length > 0, enterDelay: conflicts.length > 0 ? 0 : 200},
    () =>
      conflicts.length > 0 ? (
        <ErrorTooltip>
          {conflicts.length === 1
            ? `There is a state conflict in project "${conflicts[0].projectId}". Select the project in the outline below in order to fix it.`
            : `There are ${conflicts.length} projects that have state conflicts. They are highlighted in the outline below. `}
        </ErrorTooltip>
      ) : (
        <BasicTooltip>Outline</BasicTooltip>
      ),
  )

  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    document.addEventListener('mousemove', (e) => {
      if (e.x < 200) {
        setHovering(true)
      } else {
        setHovering(false)
      }
    })
  }, [])

  return (
    <Container>
      <TriggerContainer
        onClick={() => {
          getStudio().transaction(({stateEditors, drafts}) => {
            stateEditors.studio.ahistoric.setPinOutline(
              !drafts.ahistoric.pinOutline,
            )
          })
        }}
      >
        {triggerTooltip}
        <TriggerButton
          ref={triggerButtonRef as $IntentionalAny}
          data-testid="OutlinePanel-TriggerButton"
        >
          <VscListTree />
        </TriggerButton>
        {conflicts.length > 0 ? (
          <NumberOfConflictsIndicator>
            {conflicts.length}
          </NumberOfConflictsIndicator>
        ) : null}
        {/* <Title>Outline</Title> */}
      </TriggerContainer>
      <Content pin={pin || hovering}>
        <Body data-testid="OutlinePanel-Content">
          <ProjectsList />
        </Body>
      </Content>
    </Container>
  )
}

export default OutlinePanel
