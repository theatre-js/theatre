import getStudio from '@theatre/studio/getStudio'
import type {Studio} from '@theatre/studio/Studio'
import {usePrism} from '@theatre/dataverse-react'
import {val} from '@theatre/dataverse'
import React from 'react'
import {createGlobalStyle, StyleSheetManager} from 'styled-components'
import EnsureProjectsDontHaveErrors from './EnsureProjectsDontHaveErrors'
import PanelsRoot from './PanelsRoot'
import ProvideTheme from './ProvideTheme'
import TheTrigger from './TheTrigger'

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

export default function UIRoot({studio}: {studio: Studio}) {
  const inside = usePrism(() => {
    const visiblityState = val(studio.atomP.ahistoric.visibilityState)
    const initialised = val(studio.atomP.ephemeral.initialised)

    const shouldShowTrigger = visiblityState === 'onlyTriggerIsVisible'
    const shouldShowPanels = visiblityState === 'everythingIsVisible'

    return !initialised ? null : (
      <StyleSheetManager
        disableVendorPrefixes
        target={getStudio()!.ui.containerShadow}
      >
        <>
          <GlobalStyle />
          <ProvideTheme>
            {shouldShowTrigger && <TheTrigger />}
            {shouldShowPanels && <PanelsRoot />}
          </ProvideTheme>
        </>
      </StyleSheetManager>
    )
  }, [studio])

  return <EnsureProjectsDontHaveErrors>{inside}</EnsureProjectsDontHaveErrors>
}
