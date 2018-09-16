import reducto from '$shared/utils/redux/reducto'
import {
  $ProjectEphemeralState,
  OnDiskState,
  OnBrowserState,
} from '$tl/Project/store/types'
import {ProjectHistoricState} from '../types'
import uuid from 'uuid/v4'

const r = reducto($ProjectEphemeralState)

export const setLoadingStateToLoaded = r(
  (s, p: {diskRevisionsThatBrowserStateIsBasedOn: string[]}) => {
    s.loadingState = {
      type: 'loaded',
      diskRevisionsThatBrowserStateIsBasedOn:
        p.diskRevisionsThatBrowserStateIsBasedOn,
    }
  },
)

// export const setDiskRevisionsThatBrowserStateIsBasedOn = r(
//   (s, p: {revisions: string[]}) => {
//     s.stateLoading.diskRevisionsThatBrowserStateIsBasedOn = p.revisions
//   },
// )

export const pushOnDiskRevisionBrowserStateIsBasedOn = r(
  (s, revisionId: string) => {
    const maxNumberOfRevisions = 50
    const {loadingState} = s
    if (loadingState.type !== 'loaded') {
      throw new Error(
        `Pushing to diskRevisionsThatBrowserStateIsBasedOn only works when loadingState.type === 'loaded'`,
      )
    }
    const {diskRevisionsThatBrowserStateIsBasedOn} = loadingState
    const len = diskRevisionsThatBrowserStateIsBasedOn.length
    if (len >= maxNumberOfRevisions) {
      diskRevisionsThatBrowserStateIsBasedOn.splice(
        0,
        len - maxNumberOfRevisions + 1,
      )
    }
    diskRevisionsThatBrowserStateIsBasedOn.push(revisionId)
  },
)

export const setLoadingStateToBrowserStateIsNotBasedOnDiskStateError = r(
  (
    s,
    {
      onDiskState,
      browserState,
    }: {onDiskState: OnDiskState; browserState: OnBrowserState},
  ) => {
    s.loadingState = {
      type: 'browserStateIsNotBasedOnDiskState',
      onDiskState,
      browserState,
    }
  },
)

export const prepareExportJson = r(
  (s, p: {historicState: ProjectHistoricState}) => {
    if (s.loadingState.type !== 'loaded') {
      throw new Error(`Only implemented for loadingState.type === 'loaded'`)
    }
    const revision = uuid()
    s.lastExportedObject = {
      revision,
      definitionVersion: $env.tl.currentProjectStateDefinitionVersion,
      projectState: p.historicState,
    }
    pushOnDiskRevisionBrowserStateIsBasedOn.originalReducer(s, revision)
  },
)
