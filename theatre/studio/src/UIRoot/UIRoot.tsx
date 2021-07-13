import getStudio from '@theatre/studio/getStudio'
import {usePrism} from '@theatre/dataverse-react'
import {val} from '@theatre/dataverse'
import React from 'react'
import styled, {createGlobalStyle, StyleSheetManager} from 'styled-components'
import PanelsRoot from './PanelsRoot'
import ProvideTheme from './ProvideTheme'
import TheTrigger from './TheTrigger'
import GlobalToolbar from '@theatre/studio/toolbars/GlobalToolbar/GlobalToolbar'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {PortalContext} from 'reakit'
import type {$IntentionalAny} from '@theatre/shared/utils/types'

const GlobalStyle = createGlobalStyle`
  :host {
    contain: strict;
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

const Container = styled.div`
  z-index: 50;
  position: fixed;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  pointer-events: none;
`

export default function UIRoot() {
  const studio = getStudio()
  const [containerRef, container] = useRefAndState<HTMLDivElement>(
    undefined as $IntentionalAny,
  )
  const inside = usePrism(() => {
    const visiblityState = val(studio.atomP.ahistoric.visibilityState)
    const initialised = val(studio.atomP.ephemeral.initialised)

    const shouldShowTrigger = visiblityState === 'onlyTriggerIsVisible'
    const shouldShowPanels = visiblityState === 'everythingIsVisible'
    const shouldShowGlobalToolbar = visiblityState !== 'everythingIsHidden'

    return !initialised ? null : (
      <StyleSheetManager
        disableVendorPrefixes
        target={getStudio()!.ui.containerShadow}
      >
        <>
          <GlobalStyle />
          <ProvideTheme>
            <PortalContext.Provider value={container}>
              <Container ref={containerRef}>
                {shouldShowGlobalToolbar && <GlobalToolbar />}
                {shouldShowTrigger && <TheTrigger />}
                {shouldShowPanels && <PanelsRoot />}
              </Container>
            </PortalContext.Provider>
          </ProvideTheme>
        </>
      </StyleSheetManager>
    )
  }, [studio, containerRef, container])

  return inside
}
