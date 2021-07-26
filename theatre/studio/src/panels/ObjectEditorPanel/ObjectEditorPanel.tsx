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
  TitleBar_Punctuation,
} from '@theatre/studio/panels/BasePanel/common'

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
    pointer-events: auto;
  }
`

const Content = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  bottom: 0;
  /* transform: translateX(100%); */
  /* pointer-events: none; */

  ${Container}:hover & {
    transform: translateX(0);
  }
`

const Title = styled.div``

const headerHeight = `32px`

const Header = styled.div`
  height: ${headerHeight};
  display: flex;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
`

const Body = styled.div`
  pointer-events: auto;
  position: absolute;
  top: ${headerHeight};
  left: 0;
  right: 0;
  height: auto;
  max-height: calc(100% - ${headerHeight});
  overflow-y: scroll;
  padding: 0;
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
            <Title>
              {obj.sheet.address.sheetId}{' '}
              <TitleBar_Punctuation>{':'}&nbsp;</TitleBar_Punctuation>
              {obj.sheet.address.sheetInstanceId}{' '}
              <TitleBar_Punctuation>&nbsp;{'>'}&nbsp;</TitleBar_Punctuation>
              {obj.address.objectKey}
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
