import type {PropHighlighted} from '@theatre/studio/panels/SequenceEditorPanel/whatPropIsHighlighted'
import {css} from 'styled-components'

export const propNameTextCSS = css<{isHighlighted?: PropHighlighted}>`
  font-weight: 300;
  font-size: 11px;
  color: ${(props) => (props.isHighlighted === 'self' ? '#CCC' : '#919191')};
  text-shadow: 0.5px 0.5px 2px rgba(0, 0, 0, 0.3);
`
