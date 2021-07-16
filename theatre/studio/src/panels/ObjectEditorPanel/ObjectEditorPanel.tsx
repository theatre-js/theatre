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
  background-color: transparent;
  /* background-color: #282b2ff0; */
  box-shadow: none;

  &:after {
    position: absolute;
    display: block;
    content: ' ';
    left: 0;
    width: 1px;
    bottom: 0;
    top: 0;
    /* border-left: 1px solid #3a3a44; */
  }
`

const emptyPanel = <Container />

export const titleBarHeight = 20

export const TitleBar = styled.div`
  height: ${titleBarHeight}px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 0 10px;
  color: #adadadb3;
  border-bottom: 1px solid rgb(0 0 0 / 13%);
  background: #00000017;
  font-size: 10px;
  font-weight: 500;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

const F1_1 = styled.div`
  display: none;
`

export const TitleBar_Piece = styled.span`
  white-space: nowrap;
`

export const TitleBar_Punctuation = styled.span`
  white-space: nowrap;
  color: ${theme.panel.head.punctuation.color};
`

export const propsEditorBackground = theme.panel.bg

export const F2 = styled.div`
  background: ${propsEditorBackground};
  flex-grow: 1;
  overflow-y: scroll;
  padding: 0;
`

const F2_2 = styled.div`
  background: transparent;
  flex-grow: 1;
  overflow-y: scroll;
  padding: 6px 0 0 0;
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

    if (!obj) return <></>

    const key = prism.memo('key', () => JSON.stringify(obj.address), [obj])

    return (
      <Container>
        <PanelDragZone>
          <F1_1>
            {obj.sheet.address.sheetId}{' '}
            <TitleBar_Punctuation>{':'}&nbsp;</TitleBar_Punctuation>
            {obj.sheet.address.sheetInstanceId}{' '}
            <TitleBar_Punctuation>&nbsp;{'>'}&nbsp;</TitleBar_Punctuation>
            {obj.address.objectKey}
          </F1_1>
        </PanelDragZone>
        <F2_2>
          <DeterminePropEditor
            key={key}
            obj={obj}
            pointerToProp={obj.propsP}
            propConfig={obj.template.config}
            depth={1}
          />
        </F2_2>
      </Container>
    )
  }, [])
}

export default ObjectEditorPanel
