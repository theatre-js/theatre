import React, {useRef} from 'react'
import styled from 'styled-components'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import type {
  ToolConfigFlyoutMenu,
  ToolconfigFlyoutMenuItem,
} from '@theatre/studio/TheatreStudio'
import ToolbarIconButton from '@theatre/studio/uiComponents/toolbar/ToolbarIconButton'
import BaseMenu from '@theatre/studio/uiComponents/simpleContextMenu/ContextMenu/BaseMenu'
import usePopover from '@theatre/studio/uiComponents/Popover/usePopover'
import type {$IntentionalAny} from '@theatre/utils/types'

const Container = styled.div`
  ${pointerEventsAutoInNormalMode};
  & > svg {
    width: 1em;
    height: 1em;
    pointer-events: none;
  }
`

const ExtensionFlyoutMenu: React.FC<{
  config: ToolConfigFlyoutMenu
}> = ({config}) => {
  const triggerRef = useRef<null | HTMLElement>(null)

  const popover = usePopover(
    () => {
      const triggerBounds = triggerRef.current!.getBoundingClientRect()
      return {
        debugName: 'ExtensionFlyoutMenu:' + config.label,

        constraints: {
          maxX: triggerBounds.right,
          maxY: 8,
          minX: triggerBounds.left,
          minY: 8,
        },
        verticalGap: 2,
      }
    },
    () => {
      return (
        <BaseMenu
          items={config.items.map(
            (option: ToolconfigFlyoutMenuItem, index: number) => ({
              label: option.label,
              callback: () => {
                // this is a user-defined function, so we need to wrap it in a try/catch
                try {
                  option.onClick?.()
                } catch (e) {
                  console.error(e)
                }
              },
            }),
          )}
          onRequestClose={() => {
            popover.close('clicked')
          }}
        />
      )
    },
  )

  return (
    <Container>
      {popover.node}
      <ToolbarIconButton
        ref={triggerRef as $IntentionalAny}
        onClick={(e) => {
          popover.open(e, triggerRef.current!)
        }}
      >
        {config.label}
      </ToolbarIconButton>
    </Container>
  )
}

export default ExtensionFlyoutMenu
