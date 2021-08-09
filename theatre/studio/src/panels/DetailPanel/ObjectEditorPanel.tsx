import {getOutlineSelection} from '@theatre/studio/selectors'
import {usePrism} from '@theatre/dataverse-react'
import {prism} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import DeterminePropEditor from './propEditors/DeterminePropEditor'
import {isSheetObject} from '@theatre/shared/instanceTypes'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import {
  panelZIndexes,
  TitleBar_Piece,
  TitleBar_Punctuation,
} from '@theatre/studio/panels/BasePanel/common'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'

const Container = styled.div`
  background-color: transparent;
  pointer-events: none;
  position: fixed;
  left: 0;
  right: 0;
  top: 12px;
  bottom: 0px;
  z-index: ${panelZIndexes.propsPanel};

  &:before {
    display: block;
    content: ' ';
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    width: 20px;
    ${pointerEventsAutoInNormalMode};
  }
`

const Content = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 260px;
  bottom: 0;
  /* transform: translateX(100%); */
  /* pointer-events: none; */

  ${Container}:hover & {
    transform: translateX(0);
  }
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
  padding: 0;
  user-select: none;
`

const ObjectEditorPanel: React.FC<{}> = (props) => {
  return usePrism(() => {
    const selection = getOutlineSelection()

    const obj = selection.find((s): s is SheetObject => isSheetObject(s))

    if (!obj) return <></>

    const key = prism.memo('key', () => JSON.stringify(obj.address), [obj])

    return (
      <Container>
        <Content>
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
            <DeterminePropEditor
              key={key}
              obj={obj}
              pointerToProp={obj.propsP}
              propConfig={obj.template.config}
              depth={1}
            />
          </Body>
        </Content>
      </Container>
    )
  }, [])
}

export default ObjectEditorPanel
