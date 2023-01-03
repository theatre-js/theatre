import getStudio from '@theatre/studio/getStudio'
import {getOutlineSelection} from '@theatre/studio/selectors'
import {usePrism} from '@theatre/react'
import React, {useCallback} from 'react'
import styled from 'styled-components'
import ObjectsList from '@theatre/studio/panels/OutlinePanel/ObjectsList/ObjectsList'
import BaseItem from '@theatre/studio/panels/OutlinePanel/BaseItem'
import type Sheet from '@theatre/core/sheets/Sheet'
import {useCollapseStateInOutlinePanel} from '@theatre/studio/panels/OutlinePanel/outlinePanelUtils'

const Head = styled.div`
  display: flex;
`

const Container = styled.li<{isSelected: boolean}>`
  color: ${(props) => (props.isSelected ? 'white' : 'hsl(1, 1%, 80%)')};
`

const Body = styled.div``

export const SheetInstanceItem: React.FC<{
  depth: number
  sheet: Sheet
}> = ({sheet, depth}) => {
  const {collapsed, setCollapsed} = useCollapseStateInOutlinePanel(sheet)

  const setSelectedSheet = useCallback(() => {
    getStudio()!.transaction(({stateEditors}) => {
      stateEditors.studio.historic.panels.outline.selection.set([sheet])
    })
  }, [sheet])

  return usePrism(() => {
    const selection = getOutlineSelection()

    return (
      <BaseItem
        depth={depth}
        select={setSelectedSheet}
        setIsCollapsed={setCollapsed}
        collapsed={collapsed}
        selectionStatus={
          selection.some((s) => s === sheet)
            ? 'selected'
            : selection.some(
                (s) => s.type === 'Theatre_SheetObject' && s.sheet === sheet,
              )
            ? 'descendant-is-selected'
            : 'not-selected'
        }
        label={
          <Head>
            {sheet.address.sheetId}: {sheet.address.sheetInstanceId}
          </Head>
        }
      >
        <Body>
          <ObjectsList
            depth={depth + 1}
            sheet={sheet}
            key={'objectList' + sheet.address.sheetInstanceId}
          />
        </Body>
      </BaseItem>
    )
  }, [depth, collapsed])
}
