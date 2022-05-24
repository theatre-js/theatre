/**
 * The library providing the editor components of Theatre.js.
 *
 * @packageDocumentation
 */

import {setStudio} from '@theatre/studio/getStudio'
import {Studio} from '@theatre/studio/Studio'

import * as globalVariableNames from '@theatre/shared/globalVariableNames'
import type {$FixMe} from '@theatre/shared/utils/types'
import StudioBundle from './StudioBundle'
import type CoreBundle from '@theatre/core/CoreBundle'
import type {IStudio} from '@theatre/studio/TheatreStudio'

const studioPrivateAPI = new Studio()
setStudio(studioPrivateAPI)

/**
 * The main instance of Studio. Read more at {@link IStudio}
 */
const studio: IStudio = studioPrivateAPI.publicApi

export default studio

registerStudioBundle()

function registerStudioBundle() {
  if (typeof window == 'undefined') return

  const existingStudioBundle = (window as $FixMe)[
    globalVariableNames.studioBundle
  ]

  if (typeof existingStudioBundle !== 'undefined') {
    if (
      typeof existingStudioBundle === 'object' &&
      existingStudioBundle &&
      typeof existingStudioBundle.version === 'string'
    ) {
      throw new Error(
        `It seems that the module '@theatre/studio' is loaded more than once. This could have two possible causes:\n` +
          `1. You might have two separate versions of theatre in node_modules.\n` +
          `2. Or this might be a bundling misconfiguration, in case you're using a bundler like Webpack/ESBuild/Rollup.\n\n` +
          `Note that it **is okay** to import '@theatre/studio' multiple times. But those imports should point to the same module.`,
      )
    } else {
      throw new Error(
        `The variable window.${globalVariableNames.studioBundle} seems to be already set by a module other than @theatre/core.`,
      )
    }
  }

  const studioBundle = new StudioBundle(studioPrivateAPI)

  // @ts-ignore ignore
  window[globalVariableNames.studioBundle] = studioBundle

  const possibleCoreBundle: undefined | CoreBundle =
    // @ts-ignore ignore
    window[globalVariableNames.coreBundle]

  if (
    possibleCoreBundle &&
    possibleCoreBundle !== null &&
    possibleCoreBundle.type === 'Theatre_CoreBundle'
  ) {
    studioBundle.registerCoreBundle(possibleCoreBundle)
  }
}

// export {default as ToolbarSwitchSelect} from './uiComponents/toolbar/ToolbarSwitchSelect'
// export {default as ToolbarIconButton} from './uiComponents/toolbar/ToolbarIconButton'
export {default as ToolbarDropdownSelect} from './uiComponents/toolbar/ToolbarDropdownSelect'

export type {IScrub} from '@theatre/studio/Scrub'
export type {
  IStudio,
  IExtension,
  PaneInstance,
  PaneClassDefinition,
  IStudioUI,
  _StudioInitializeOpts,
  ToolsetConfig,
  ToolConfig,
  ToolConfigIcon,
  ToolConfigSwitch,
} from '@theatre/studio/TheatreStudio'
