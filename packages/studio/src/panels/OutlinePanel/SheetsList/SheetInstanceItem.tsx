import getStudio from '@theatre/studio/getStudio'
import {outlineSelection} from '@theatre/studio/selectors'
import {useVal} from '@theatre/react'
import React, {useCallback} from 'react'
import styled from 'styled-components'
import ObjectsList from '@theatre/studio/panels/OutlinePanel/ObjectsList/ObjectsList'
import BaseItem from '@theatre/studio/panels/OutlinePanel/BaseItem'
import type Sheet from '@theatre/core/sheets/Sheet'
import {useCollapseStateInOutlinePanel} from '@theatre/studio/panels/OutlinePanel/outlinePanelUtils'
import useChordial from '@theatre/studio/uiComponents/chordial/useChodrial'

const Head = styled.div`
  display: flex;
`

const Body = styled.div``

export const SheetInstanceItem: React.FC<{
  depth: number
  sheet: Sheet
}> = ({sheet, depth}) => {
  const {collapsed, setCollapsed} = useCollapseStateInOutlinePanel(sheet)

  const setSelectedSheet = useCallback(() => {
    getStudio()!.transaction(({stateEditors}) => {
      stateEditors.studio.historic.panels.outline.selection.set([
        {...sheet.address, type: 'Sheet'},
      ])
    })
  }, [sheet])

  const selection = useVal(outlineSelection)

  const {targetRef} = useChordial(() => {
    return {
      title: `Sheet: ${sheet.address.sheetId} (instance: ${sheet.address.sheetInstanceId})`,
      items: [],
    }
  })

  return (
    <BaseItem
      depth={depth}
      select={setSelectedSheet}
      setIsCollapsed={setCollapsed}
      collapsed={collapsed}
      headerRef={targetRef}
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
}
