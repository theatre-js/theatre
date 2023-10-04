import type {Studio} from '@theatre/studio/Studio'
import delay from '@theatre/utils/delay'
import type Project from './Project'
import type {OnDiskState} from '@theatre/sync-server/state/types'
import globals from '@theatre/shared/globals'
import {val} from '@theatre/dataverse'

/**
 * @remarks
 * TODO this could be turned into a simple prism, like:
 * `editor.isReady: Prism<{isReady: true} | {isReady: false, reason: 'conflictBetweenDiskStateAndBrowserState'}>`
 */
export default async function initialiseProjectState(
  studio: Studio,
  project: Project,
  onDiskState: OnDiskState | undefined,
) {
  /*
   * If in the future we move to IndexedDB to store the state, we'll have
   * to deal with it being async (as opposed to localStorage that is synchronous.)
   * so here we're artifically delaying the loading of the state to make sure users
   * don't count on the state always being already loaded synchronously
   */
  await delay(0)

  const projectId = project.address.projectId

  studio.ephemeralAtom.setByPointer((p) => p.coreByProject[projectId], {
    lastExportedObject: null,
    loadingState: {type: 'loading'},
  })

  const browserState = val(studio.atomP.historic.coreByProject[projectId])

  if (!browserState) {
    if (!onDiskState) {
      useInitialState()
    } else {
      useOnDiskState(onDiskState)
    }
  } else {
    if (!onDiskState) {
      useBrowserState()
    } else {
      if (
        browserState.revisionHistory.indexOf(onDiskState.revisionHistory[0]) ==
        -1
      ) {
        browserStateIsNotBasedOnDiskState(onDiskState)
      } else {
        useBrowserState()
      }
    }
  }

  function useInitialState() {
    studio.transaction(({stateEditors}) => {
      stateEditors.coreByProject.historic.setProjectState({
        projectId,
        state: {
          sheetsById: {},
          definitionVersion: globals.currentProjectStateDefinitionVersion,
          revisionHistory: [],
        },
      })
    }, false)
    studio.ephemeralAtom.setByPointer(
      (p) => p.coreByProject[projectId].loadingState,
      {
        type: 'loaded',
      },
    )
  }

  function useOnDiskState(state: OnDiskState) {
    studio.transaction(({stateEditors}) => {
      stateEditors.coreByProject.historic.setProjectState({
        projectId,
        state,
      })
    })

    studio.ephemeralAtom.setByPointer(
      (p) => p.coreByProject[projectId].loadingState,
      {
        type: 'loaded',
      },
    )
  }

  function useBrowserState() {
    studio.ephemeralAtom.setByPointer(
      (p) => p.coreByProject[projectId].loadingState,
      {
        type: 'loaded',
      },
    )
  }

  function browserStateIsNotBasedOnDiskState(onDiskState: OnDiskState) {
    studio.ephemeralAtom.setByPointer(
      (p) => p.coreByProject[projectId].loadingState,
      {
        type: 'browserStateIsNotBasedOnDiskState',
        onDiskState,
      },
    )
  }
}
