import type Studio from '@theatre/studio/Studio'
import delay from '@theatre/shared/utils/delay'
import {original} from 'immer'
import type Project from './Project'
import type {OnDiskState} from './store/storeTypes'

/**
 * @todo this could be turned into a simple derivation, like:
 * editor.isReady: IDerivation<{isReady: true} | {isReady: false, readon: 'conflictBetweenDiskStateAndBrowserState'}>
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

  studio.transaction(({drafts}) => {
    const projectId = project.address.projectId

    drafts.ephemeral.coreByProject[projectId] = {
      lastExportedObject: null,
      loadingState: {type: 'loading'},
    }

    drafts.ahistoric.coreByProject[projectId] = {
      ahistoricStuff: '',
    }

    function useInitialState() {
      drafts.ephemeral.coreByProject[projectId].loadingState = {
        type: 'loaded',
      }

      drafts.historic.coreByProject[projectId] = {
        sheetsById: {},
        definitionVersion: $env.currentProjectStateDefinitionVersion,
      }
    }

    function useOnDiskState(state: OnDiskState) {
      drafts.ephemeral.coreByProject[projectId].loadingState = {
        type: 'loaded',
      }

      drafts.historic.coreByProject[projectId] = state
    }

    function useBrowserState() {
      drafts.ephemeral.coreByProject[projectId].loadingState = {
        type: 'loaded',
      }
    }

    function browserStateIsNotBasedOnDiskState(onDiskState: OnDiskState) {
      drafts.ephemeral.coreByProject[projectId].loadingState = {
        type: 'browserStateIsNotBasedOnDiskState',
        onDiskState,
      }
    }

    const browserState = original(drafts.historic)?.coreByProject[
      project.address.projectId
    ]

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
          !browserState.exportBookkeeping ||
          browserState.exportBookkeeping.basedOnRevisions.indexOf(
            onDiskState.exportBookkeeping.revision,
          ) == -1
        ) {
          browserStateIsNotBasedOnDiskState(onDiskState)
        } else {
          useBrowserState()
        }
      }
    }
  })
}
