import React, {useEffect, useRef} from 'react'
import usePopover from '@theatre/studio/uiComponents/Popover/usePopover'
import ToolbarIconButton from '@theatre/studio/uiComponents/toolbar/ToolbarIconButton'
import {Cube} from '@theatre/studio/uiComponents/icons'
import styled from 'styled-components'
import type {$FixMe} from '@theatre/dataverse/src/types'
import getStudio from '@theatre/studio/getStudio'

const SyncStuffToolbar: React.FC<{}> = (props) => {
  const panel = usePopover(
    {
      debugName: 'panel',
      closeOnClickOutside: false,
      closeWhenPointerIsDistant: false,
    },
    () => <TheStuff />,
  )
  const panelTriggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    panel.open({clientX: 0, clientY: 0}, panelTriggerRef.current!)
  }, [])

  return (
    <>
      {panel.node}
      <ToolbarIconButton
        ref={panelTriggerRef}
        onClick={(e) => {
          panel.toggle(e, panelTriggerRef.current!)
        }}
      >
        <Cube />
      </ToolbarIconButton>
    </>
  )
}

const Container = styled.div`
  width: 400px;
  border-radius: 2px;
  padding: 8px;
  background-color: rgba(42, 45, 50, 0.9);
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  box-shadow:
    0px 1px 1px rgba(0, 0, 0, 0.25),
    0px 2px 6px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(14px);
  pointer-events: auto;
  // makes the edges of the item highlights match the rounded corners
  overflow: hidden;

  @supports not (backdrop-filter: blur()) {
    background-color: rgba(42, 45, 50, 0.98);
  }

  color: rgba(255, 255, 255, 0.9);

  & a {
    // Fix colors of links to not be default
    color: inherit;
  }
`

const TheStuff = React.forwardRef(
  (props: {}, ref: React.Ref<null | HTMLDivElement>) => {
    useEffect(() => {
      void getStudio()
        .authenticate({skipIfAlreadyAuthenticated: true})
        .then((res) => {
          console.log('auth result', res)
          if (!res.success) {
            console.error(`err`, res)
            return
          }
          // return syncStore.appApi.projects.create.mutate({}).then((res) => {
          //   const {id} = res
          //   console.log('id', id)
          //   return syncStore.syncServerApi.projectState.set.mutate({
          //     id,
          //     data: JSON.stringify('yeah baby'),
          //   })
          // })
        })
    }, [])
    return <Container ref={ref as $FixMe}>here be auth stuff</Container>
  },
)

export default SyncStuffToolbar
