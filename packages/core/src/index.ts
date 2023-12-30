/**
 * The library providing the runtime functionality of Theatre.js.
 *
 * @packageDocumentation
 */

export * from './coreExports'
export * from './types/public'
import {defer} from '@theatre/utils/defer'
// export type {IProject, IProjectConfig} from './projects/TheatreProject'
// export type {ISequence} from './sequences/TheatreSequence'
// export type {ISheetObject} from './sheetObjects/TheatreSheetObject'
// export type {ISheet} from './sheets/TheatreSheet'
// import type StudioBundle from '@theatre/studio/StudioBundle'
import CoreBundle from './CoreBundle'
import {globalVariableNames} from './globals'
import type {$____FixmeStudio} from '@theatre/utils/types'
import type {IStudio, InitOpts} from './types/public'

const studioDeferred = defer<$____FixmeStudio>()

export async function getStudio(): Promise<IStudio> {
  return (await studioDeferred.promise).publicApi
}

export function getStudioSync(
  errorIfNotReady: boolean = false,
): IStudio | undefined {
  if (studioDeferred.status !== 'resolved') {
    if (errorIfNotReady) throw new Error(`Studio is not ready yet.`)
    return undefined
  }
  return studioDeferred.currentValue!.publicApi
}

let initCalled = false
const initOptsDeferred = defer<InitOpts | undefined>()

export async function init(opts?: InitOpts) {
  if (initCalled) {
    return
  }
  initCalled = true
  initOptsDeferred.resolve(opts)
}

const theatre = {getStudio, getStudioSync, init}
export default theatre

type StudioBundle = $____FixmeStudio // todo

registerCoreBundle()

/**
 * @remarks
 * the studio and core need to communicate with each other somehow, and currently we do that
 * by registering each of them as a global variable. This function does the work of registering
 * the core bundle (everything exported from `@theatre/core`) to window.__TheatreJS_CoreBundle.
 */
function registerCoreBundle() {
  // This only works in a browser environment
  if (
    typeof window == 'undefined' &&
    global.__THEATREJS__FORCE_CONNECT_CORE_AND_STUDIO !== true
  )
    return

  const globalContext = typeof window !== 'undefined' ? window : global

  // another core bundle may already be registered

  const existingBundle: CoreBundle | undefined =
    // @ts-ignore ignore
    globalContext[globalVariableNames.coreBundle]

  if (typeof existingBundle !== 'undefined') {
    if (
      typeof existingBundle === 'object' &&
      existingBundle &&
      typeof existingBundle.version === 'string'
    ) {
      /*
      Another core bundle is registered. This usually means the bundler is not configured correctly and
      is bundling `@theatre/core` multiple times, but, there are legitimate scenarios where a user may want
      to include multiple instances of `@theatre/core` on the same page.

      For example, an article might embed two separate interactive graphics that
      are made by different teams (and even different tech stacks -- one in JS, the other in clojurescript).

      If both of those graphics use Theatre.js, our current setup makes them conflict with one another.

      ----------------------
      --------------------
      ----------------------
      -------.

      |   /\_/\   |
      |  ( o.o )  |      --------> graphic1 made with JS+Theatre.js
      |   > ^ <   |

      ## ---
      ----------------------
      --------------------
      ----------------------
      -------.

      |    __      _   |
      |  o'')}____//   | --------> graphic2 made with clojurescript+Theatre.js
      |  `_/      )    |
      |  (_(_/-(_/     |
      
      ---------------------
      -----♥.

      @todo Make it possible to have multiple separate bundles on the same page, but still communicate
      that there is more than one bundle so we can warn the user about bundler misconfiguration.
      
      */
      throw new Error(
        `It seems that the module '@theatre/core' is loaded more than once. This could have two possible causes:\n` +
          `1. You might have two separate versions of Theatre.js in node_modules.\n` +
          `2. Or this might be a bundling misconfiguration, in case you're using a bundler like Webpack/ESBuild/Rollup.\n\n` +
          `Note that it **is okay** to import '@theatre/core' multiple times. But those imports should point to the same module.`,
      )
    } else {
      throw new Error(
        `The variable window.${globalVariableNames.coreBundle} seems to be already set by a module other than @theatre/core.`,
      )
    }
  }

  const coreBundle = new CoreBundle({
    onAttach: (s) => {
      initOptsDeferred.promise.then((opts) => {
        s.initialize(opts)
        studioDeferred.resolve(s)
      })
    },
  })

  // @ts-ignore ignore
  globalContext[globalVariableNames.coreBundle] = coreBundle

  const possibleExistingStudioBundle: undefined | StudioBundle =
    // @ts-ignore ignore
    globalContext[globalVariableNames.studioBundle]

  if (
    possibleExistingStudioBundle &&
    possibleExistingStudioBundle !== null &&
    possibleExistingStudioBundle.type === 'Theatre_StudioBundle'
  ) {
    possibleExistingStudioBundle.registerCoreBundle(coreBundle)
  }
}
