import {lighten} from 'polished'
import {css} from 'styled-components'

/**
 * This CSS string is used to correctly set pointer-events on an element
 * when the pointer is dragging something.
 * Naming explanation: "NormalMode" as opposed to dragging mode.
 *
 * @see PointerEventsHandler - the place that sets `.normal` on #pointer-root
 */
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
