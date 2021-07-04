import {theme} from '@theatre/studio/css'
import {getOutlineSelection} from '@theatre/studio/selectors'
import {usePrism} from '@theatre/dataverse-react'
import {prism} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import DeterminePropEditor from './propEditors/DeterminePropEditor'
import type {PanelPosition} from '@theatre/studio/store/types/historic'
import BasePanel from '@theatre/studio/panels/BasePanel/BasePanel'
import PanelWrapper from '@theatre/studio/panels/BasePanel/PanelWrapper'
import PanelDragZone from '@theatre/studio/panels/BasePanel/PanelDragZone'
import {isSheetObject} from '@theatre/shared/instanceTypes'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'

const Container = styled(PanelWrapper)`
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
`

const emptyPanel = <Container />

export const F1Height = 40

export const F1 = styled.div`
  height: ${F1Height}px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  color: ${theme.panel.head.title.color};
  font-size: 11px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.45);
  background: ${theme.panel.bg};
  box-size: border-box;
`

export const Punctuation = styled.span`
  color: ${theme.panel.head.punctuation.color};
`

export const propsEditorBackground = theme.panel.bg

export const F2 = styled.div`
  background: ${propsEditorBackground};
  flex-grow: 1;
  overflow-y: scroll;
  padding: 0;
`

const defaultPosition: PanelPosition = {
  edges: {
    left: {from: 'screenRight', distance: 0.4},
    right: {from: 'screenRight', distance: 0.2},
    top: {from: 'screenTop', distance: 0.2},
    bottom: {from: 'screenBottom', distance: 0.2},
  },
}

const minDims = {width: 300, height: 300}

const ObjectEditorPanel: React.FC<{}> = (props) => {
  return (
    <BasePanel
      panelId="objectEditor"
      defaultPosition={defaultPosition}
      minDims={minDims}
    >
      <Content />
    </BasePanel>
  )
}

const Content: React.FC<{}> = () => {
  return usePrism(() => {
    const selection = getOutlineSelection()

    const obj = selection.find((s): s is SheetObject => isSheetObject(s))

    if (!obj) return emptyPanel

    const key = prism.memo('key', () => JSON.stringify(obj.address), [obj])

    return (
      <Container>
        <PanelDragZone>
          <F1>
            {obj.sheet.address.sheetId} <Punctuation>{':'}&nbsp;</Punctuation>
            {obj.sheet.address.sheetInstanceId}{' '}
            <Punctuation>&nbsp;{'>'}&nbsp;</Punctuation>
            {obj.address.objectKey}
          </F1>
        </PanelDragZone>
        <F2>
          <DeterminePropEditor
            key={key}
            obj={obj}
            pointerToProp={obj.propsP}
            propConfig={obj.template.config}
            depth={1}
          />
        </F2>
      </Container>
    )
  }, [])
}

export default ObjectEditorPanel
