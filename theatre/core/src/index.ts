/**
 * The library providing the runtime functionality of Theatre.js.
 *
 * @packageDocumentation
 */

export * from './coreExports'
export type {
  IProject,
  IProjectConfig,
} from '@theatre/core/projects/TheatreProject'
export type {ISequence} from '@theatre/core/sequences/TheatreSequence'
export type {ISheetObject} from '@theatre/core/sheetObjects/TheatreSheetObject'
export type {ISheet} from '@theatre/core/sheets/TheatreSheet'
import * as globalVariableNames from '@theatre/shared/globalVariableNames'
import type StudioBundle from '@theatre/studio/StudioBundle'
import CoreBundle from './CoreBundle'

registerCoreBundle()

function registerCoreBundle() {
  if (typeof window == 'undefined') return

  // @ts-ignore ignore
  const existingBundle = window[globalVariableNames.coreBundle]

  if (typeof existingBundle !== 'undefined') {
    if (
      typeof existingBundle === 'object' &&
      existingBundle &&
      typeof existingBundle.version === 'string'
    ) {
      throw new Error(
        `It seems that the module '@theatre/core' is loaded more than once. This could have two possible causes:\n` +
          `1. You might have two separate versions of theatre in node_modules.\n` +
          `2. Or this might be a bundling misconfiguration, in case you're using a bundler like Webpack/ESBuild/Rollup.\n\n` +
          `Note that it **is okay** to import '@theatre/core' multiple times. But those imports should point to the same module.`,
      )
    } else {
      throw new Error(
        `The variable window.${globalVariableNames.coreBundle} seems to be already set by a module other than @theatre/core.`,
      )
    }
  }

  const coreBundle = new CoreBundle()

  // @ts-ignore ignore
  window[globalVariableNames.coreBundle] = coreBundle

  const possibleExistingStudioBundle: undefined | StudioBundle =
    // @ts-ignore ignore
    window[globalVariableNames.studioBundle]

  if (
    possibleExistingStudioBundle &&
    possibleExistingStudioBundle !== null &&
    possibleExistingStudioBundle.type === 'Theatre_StudioBundle'
  ) {
    possibleExistingStudioBundle.registerCoreBundle(coreBundle)
  }
}
