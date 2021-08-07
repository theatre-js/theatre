import {lighten} from 'polished'
import {css} from 'styled-components'

export const pointerEventsAutoInNormalMode = css`
  #pointer-root & {
    pointer-events: none;
  }
  #pointer-root.normal & {
    pointer-events: auto;
  }
`

export const theme = {
  panel: {
    bg: `#282b2f`,
    head: {
      title: {
        color: `#bbb`,
      },
      punctuation: {
        color: `#808080`,
      },
    },
    body: {
      compoudThing: {
        label: {
          get color(): string {
            return lighten(0.6, theme.panel.bg)
          },
        },
      },
    },
  },
}

export const panelUtils = {
  panelBorder: `2px solid #1f1f1f`,
}
