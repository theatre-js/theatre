import {theme} from '@theatre/studio/css'
import styled from 'styled-components'

export const panelZIndexes = {
  get outlinePanel() {
    return 1
  },

  get propsPanel() {
    return panelZIndexes.outlinePanel
  },

  get sequenceEditorPanel() {
    return this.outlinePanel - 1
  },

  get toolbar() {
    return this.outlinePanel + 1
  },

  get pluginPanes() {
    return this.sequenceEditorPanel - 1
  },
}

export const propsEditorBackground = theme.panel.bg

export const TitleBar_Piece = styled.span`
  white-space: nowrap;
`

export const TitleBar_Punctuation = styled.span`
  white-space: nowrap;
  color: ${theme.panel.head.punctuation.color};
`

export const F2 = styled.div`
  background: ${propsEditorBackground};
  flex-grow: 1;
  overflow-y: scroll;
  padding: 0;
`

export const titleBarHeight = 18

export const TitleBar = styled.div`
  height: ${titleBarHeight}px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 0 10px;
  position: relative;
  color: #adadadb3;
  border-bottom: 1px solid rgb(0 0 0 / 13%);
  background-color: #25272b;
  font-size: 10px;
  font-weight: 500;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`

// the minimum visible width or height when the panel is partially offscreen
export const minVisibleSize = 100
