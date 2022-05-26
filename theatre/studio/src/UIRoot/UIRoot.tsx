import getStudio from '@theatre/studio/getStudio'
import {usePrism, useVal} from '@theatre/react'
import {val} from '@theatre/dataverse'
import React, {useEffect} from 'react'
import styled, {createGlobalStyle} from 'styled-components'
import PanelsRoot from './PanelsRoot'
import GlobalToolbar from '@theatre/studio/toolbars/GlobalToolbar'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {PortalContext} from 'reakit'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import useKeyboardShortcuts from './useKeyboardShortcuts'
import PointerEventsHandler from '@theatre/studio/uiComponents/PointerEventsHandler'
import TooltipContext from '@theatre/studio/uiComponents/Popover/TooltipContext'
import {ProvidePointerCapturing} from './PointerCapturing'
import {MountAll} from '@theatre/studio/utils/renderInPortalInContext'
import {PortalLayer, ProvideStyles} from '@theatre/studio/css'
import {
  createTheatreInternalLogger,
  TheatreLoggerLevel,
} from '@theatre/shared/logger'
import {ProvideLogger} from '@theatre/studio/uiComponents/useLogger'

const MakeRootHostContainStatic =
  typeof window !== 'undefined'
    ? createGlobalStyle`
  :host {
    contain: strict;
  }
`
    : ({} as ReturnType<typeof createGlobalStyle>)

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

const INTERNAL_LOGGING = /Playground.+Theatre\.js/.test(
  (typeof document !== 'undefined' ? document?.title : null) ?? '',
)

export default function UIRoot() {
  const studio = getStudio()
  const [portalLayerRef, portalLayer] = useRefAndState<HTMLDivElement>(
    undefined as $IntentionalAny,
  )

  const uiRootLogger = createTheatreInternalLogger()
  uiRootLogger.configureLogging({
    min: TheatreLoggerLevel.DEBUG,
    dev: INTERNAL_LOGGING,
    internal: INTERNAL_LOGGING,
  })
  const logger = uiRootLogger.getLogger().named('Theatre UIRoot')

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
      <ProvideLogger logger={logger}>
        <TooltipContext>
          <ProvidePointerCapturing>
            <MountExtensionComponents />
            <PortalContext.Provider value={portalLayer}>
              <ProvideStyles
                target={
                  window.__IS_VISUAL_REGRESSION_TESTING === true
                    ? undefined
                    : getStudio()!.ui.containerShadow
                }
              >
                <>
                  <MakeRootHostContainStatic />
                  <Container
                    className={
                      visiblityState === 'everythingIsHidden' ? 'invisible' : ''
                    }
                  >
                    <PortalLayer ref={portalLayerRef} />
                    <GlobalToolbar />
                    <PanelsRoot />
                  </Container>
                </>
              </ProvideStyles>
            </PortalContext.Provider>
          </ProvidePointerCapturing>
        </TooltipContext>
      </ProvideLogger>
    )
  }, [studio, portalLayerRef, portalLayer])

  return inside
}

const MountExtensionComponents: React.FC<{}> = () => {
  return <MountAll />
}
