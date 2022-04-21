import getStudio from '@theatre/studio/getStudio'
import {usePrism, useVal} from '@theatre/react'
import {val} from '@theatre/dataverse'
import React, {useEffect} from 'react'
import styled, {createGlobalStyle, StyleSheetManager} from 'styled-components'
import PanelsRoot from './PanelsRoot'
import ProvideTheme from './ProvideTheme'
import GlobalToolbar from '@theatre/studio/toolbars/GlobalToolbar/GlobalToolbar'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {PortalContext} from 'reakit'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import useKeyboardShortcuts from './useKeyboardShortcuts'
import PointerEventsHandler from '@theatre/studio/uiComponents/PointerEventsHandler'
import TooltipContext from '@theatre/studio/uiComponents/Popover/TooltipContext'

const GlobalStyle = createGlobalStyle`
  :host {
    all: initial;
    contain: strict;
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

const Container = styled(PointerEventsHandler)`
  z-index: 50;
  position: fixed;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;

  &.invisible {
    pointer-events: none !important;
    opacity: 0;
    transform: translateX(1000000px);
  }
`

const PortalLayer = styled.div`
  z-index: 51;
  position: fixed;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  pointer-events: none;
`

export default function UIRoot() {
  const studio = getStudio()
  const [portalLayerRef, portalLayer] = useRefAndState<HTMLDivElement>(
    undefined as $IntentionalAny,
  )
  const [containerRef, container] = useRefAndState<HTMLDivElement>(
    undefined as $IntentionalAny,
  )

  useKeyboardShortcuts()
  const visiblityState = useVal(studio.atomP.ahistoric.visibilityState)
  useEffect(() => {
    if (visiblityState === 'everythingIsHidden') {
      console.warn(
        `Theatre Studio is hidden. Use the keyboard shortcut 'alt + \\' to restore the studio, or call studio.ui.restore().`,
      )
    }
    return () => {}
  }, [visiblityState])

  const inside = usePrism(() => {
    const visiblityState = val(studio.atomP.ahistoric.visibilityState)

    const initialised = val(studio.atomP.ephemeral.initialised)

    return !initialised ? null : (
      <StyleSheetManager
        disableVendorPrefixes
        target={
          window.__IS_VISUAL_REGRESSION_TESTING === true
            ? undefined
            : getStudio()!.ui.containerShadow
        }
      >
        <>
          <GlobalStyle />
          <ProvideTheme>
            <PortalContext.Provider value={portalLayer}>
              <TooltipContext>
                <Container
                  className={
                    visiblityState === 'everythingIsHidden' ? 'invisible' : ''
                  }
                >
                  <PortalLayer ref={portalLayerRef} />
                  {<GlobalToolbar />}
                  {<PanelsRoot />}
                </Container>
              </TooltipContext>
            </PortalContext.Provider>
          </ProvideTheme>
        </>
      </StyleSheetManager>
    )
  }, [studio, portalLayerRef, portalLayer])

  return inside
}
