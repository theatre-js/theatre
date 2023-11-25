import {lighten} from 'polished'
import {css} from 'styled-components'
import styled, {createGlobalStyle, StyleSheetManager} from 'styled-components'
import React, {useLayoutEffect, useState} from 'react'
import ReactDOM from 'react-dom'
import type {$IntentionalAny} from '@theatre/utils/types'
import {PortalContext} from 'reakit'
import useRefAndState from './utils/useRefAndState'

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

const GlobalStyle =
  typeof window !== 'undefined'
    ? createGlobalStyle`
        :host {
          all: initial;
          color: white;
          font:
            11px -apple-system,
            BlinkMacSystemFont,
            Segoe WPC,
            Segoe Editor,
            HelveticaNeue-Light,
            Ubuntu,
            Droid Sans,
            sans-serif;

          // external links
          a[href^='http'] {
            text-decoration: none;
            text-decoration-line: underline;
            text-decoration-color: #888;
            position: relative;
            display: inline-block;
            margin-left: 0.4em;

            &:hover,
            &:active {
              text-decoration-color: #ccc;
            }
          }

          // from tailwind
          .text-xs {
            font-size: 0.75rem; /* 12px */
            line-height: 1rem; /* 16px */
          }
          .text-sm {
            font-size: 0.875rem; /* 14px */
            line-height: 1.25rem; /* 20px */
          }
          .text-base {
            font-size: 1rem; /* 16px */
            line-height: 1.5rem; /* 24px */
          }
          .text-lg {
            font-size: 1.125rem; /* 18px */
            line-height: 1.75rem; /* 28px */
          }
          .text-xl {
            font-size: 1.25rem; /* 20px */
            line-height: 1.75rem; /* 28px */
          }
          .text-2xl {
            font-size: 1.5rem; /* 24px */
            line-height: 2rem; /* 32px */
          }
          .text-3xl {
            font-size: 1.875rem; /* 30px */
            line-height: 2.25rem; /* 36px */
          }
          .text-4xl {
            font-size: 2.25rem; /* 36px */
            line-height: 2.5rem; /* 40px */
          }
          .text-5xl {
            font-size: 3rem; /* 48px */
            line-height: 1;
          }
          .text-6xl {
            font-size: 3.75rem; /* 60px */
            line-height: 1;
          }
          .text-7xl {
            font-size: 4.5rem; /* 72px */
            line-height: 1;
          }
          .text-8xl {
            font-size: 6rem; /* 96px */
            line-height: 1;
          }
          .text-9xl {
            font-size: 8rem; /* 128px */
            line-height: 1;
          }

          .font-thin {
            font-weight: 100;
          }
          .font-extralight {
            font-weight: 200;
          }
          .font-light {
            font-weight: 300;
          }
          .font-normal {
            font-weight: 400;
          }
          .font-medium {
            font-weight: 500;
          }
          .font-semibold {
            font-weight: 600;
          }
          .font-bold {
            font-weight: 700;
          }
          .font-extrabold {
            font-weight: 800;
          }
          .font-black {
            font-weight: 900;
          }

          .text-left {
            text-align: left;
          }
          .text-center {
            text-align: center;
          }
          .text-right {
            text-align: right;
          }

          .text-color-pale {
            color: #CCC;
          }
        }

        * {
          padding: 0;
          margin: 0;
          font-size: 100%;
          font: inherit;
          vertical-align: baseline;
          list-style: none;
        }
      `
    : ({} as ReturnType<typeof createGlobalStyle>)

export const PortalLayer = styled.div`
  z-index: 51;
  position: fixed;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  pointer-events: none;
`

export const ProvideStyles: React.FC<{
  target: undefined | HTMLElement
  children: React.ReactNode
}> = (props) => {
  return (
    <StyleSheetManager disableVendorPrefixes target={props.target}>
      <>
        <GlobalStyle />
        {props.children}
      </>
    </StyleSheetManager>
  )
}

export function withStyledShadow<Props extends {}>(
  Comp: React.ComponentType<Props>,
): React.ComponentType<Props> {
  return (props) => (
    <ProvideStyledShadow>
      <Comp {...props} />
    </ProvideStyledShadow>
  )
}

const ProvideStyledShadow: React.FC<{
  children: React.ReactNode
}> = (props) => {
  const [template, ref] = useState<null | HTMLTemplateElement>(null)
  const [shadowRoot, setShadowRoot] = useState<null | ShadowRoot>(null)

  useLayoutEffect(() => {
    if (!template) return
    const {parentNode} = template
    if (!parentNode) return

    const hadShadowRoot =
      // @ts-ignore
      !!parentNode.shadowRoot

    const shadowRoot = hadShadowRoot
      ? // @ts-ignore
        parent.shadowRoot
      : (parentNode as HTMLElement).attachShadow({
          mode: 'open',
        })

    setShadowRoot(shadowRoot)

    // no need to cleanup. The parent will be removed anyway if cleanup
    // is needed.
  }, [template])

  const [portalLayerRef, portalLayer] = useRefAndState<HTMLDivElement>(
    undefined as $IntentionalAny,
  )

  if (!shadowRoot) {
    return (
      <template ref={ref} shadow-root={'open'}>
        {props.children}
      </template>
    )
  }

  return ReactDOM.createPortal(
    <ProvideStyles target={shadowRoot as $IntentionalAny as HTMLElement}>
      <>
        <PortalLayer ref={portalLayerRef} />
        <PortalContext.Provider value={portalLayer}>
          {props.children}
        </PortalContext.Provider>
      </>
    </ProvideStyles>,
    shadowRoot as $IntentionalAny as HTMLElement,
  )
}
