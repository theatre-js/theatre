import {lighten} from 'polished'
import {css} from 'styled-components'
import styled, {createGlobalStyle, StyleSheetManager} from 'styled-components'
import React, {useLayoutEffect, useState} from 'react'
import ReactDOM from 'react-dom'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
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
    font: 11px -apple-system, BlinkMacSystemFont, Segoe WPC, Segoe Editor,
      HelveticaNeue-Light, Ubuntu, Droid Sans, sans-serif;
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

export const ProvideStyles: React.FC<{target: undefined | HTMLElement}> = (
  props,
) => {
  return (
    <StyleSheetManager disableVendorPrefixes target={props.target}>
      <>
        <GlobalStyle />
        {props.children}
      </>
    </StyleSheetManager>
  )
}

export function withStyledShadow<Props>(
  Comp: React.ComponentType<Props>,
): React.ComponentType<Props> {
  return (props) => (
    <ProvideStyledShadow>
      <Comp {...props} />
    </ProvideStyledShadow>
  )
}

const ProvideStyledShadow: React.FC<{}> = (props) => {
  const [template, ref] = useState<null | HTMLTemplateElement>(null)
  const [shadowRoot, setShadowRoot] = useState<null | ShadowRoot>(null)

  useLayoutEffect(() => {
    if (!template) return
    const shadowRoot = (template.parentNode as HTMLElement).attachShadow({
      mode: 'open',
    })
    setShadowRoot(shadowRoot)

    return () => {
      template.parentNode?.removeChild(shadowRoot)
    }
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
