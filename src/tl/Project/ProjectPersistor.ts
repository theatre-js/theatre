import InternalProject from './InternalProject'
import {OnDiskState, OnBrowserState} from '$tl/Project/store/types'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'
import {val} from '$shared/DataVerse2/atom'
import {debounce} from '$shared/utils'
import {Pointer} from '$shared/DataVerse2/pointer'

export default class ProjectPersistor {
  _storageKey: string
  constructor(readonly internalProject: InternalProject) {
    this._storageKey = $env.tl.projectPersistencePrefix + internalProject.id
    this._initialize().then(
      () => {},
      error => {
        // @todo
        console.error(error)
      },
    )
  }

  async _initialize() {
    await this._load()
    await this._startPersisting()
  }

  async _load() {
    const onDiskState = this.internalProject.config.state
    const browserState = getBrowserPersistedState(this._storageKey)

    if (!browserState) {
      if (!onDiskState) {
        await this._useInitialState()
      } else {
        await this._useOnDiskState(onDiskState)
      }
    } else {
      if (!onDiskState) {
        await this._useBrowserState(browserState)
      } else {
        if (browserState.basedOnRevisions.indexOf(onDiskState.revision) == -1) {
          await this._browserStateIsNotBasedOnDiskState(
            browserState,
            onDiskState,
          )
        } else {
          await this._useBrowserState(browserState)
        }
      }
    }
  }

  async _useOnDiskState(onDiskState: OnDiskState) {
    const {internalProject} = this
    internalProject._dispatch(
      internalProject._actions.historic.__unsafe_clearHistoryAndReplaceInnerState(
        onDiskState.projectState,
      ),
      internalProject._actions.ephemeral.setLoadingStateToLoaded({
        diskRevisionsThatBrowserStateIsBasedOn: [onDiskState.revision],
      }),
    )
  }

  async _useInitialState() {
    const {internalProject} = this
    internalProject._dispatch(
      internalProject._actions.ephemeral.setLoadingStateToLoaded({
        diskRevisionsThatBrowserStateIsBasedOn: [],
      }),
    )
  }

  async _useBrowserState(browserState: OnBrowserState) {
    const {internalProject} = this
    internalProject._dispatch(
      internalProject._actions.historic.__unsafe_replaceHistory(
        browserState.projectHistory,
      ),
      internalProject._actions.ephemeral.setLoadingStateToLoaded({
        diskRevisionsThatBrowserStateIsBasedOn: browserState.basedOnRevisions,
      }),
    )
  }

  async _browserStateIsNotBasedOnDiskState(
    browserState: OnBrowserState,
    onDiskState: OnDiskState,
  ) {
    const {internalProject} = this

    internalProject._dispatch(
      internalProject._actions.ephemeral.setLoadingStateToBrowserStateIsNotBasedOnDiskStateError(
        {
          onDiskState,
          browserState,
        },
      ),
    )
  }

  _loadOnDiskStateIntoRedux(s: OnDiskState) {
    this.internalProject.reduxStore.dispatch(
      this.internalProject._actions.historic.__unsafe_clearHistoryAndReplaceInnerState(
        s,
      ),
    )
  }

  _loadBrowserPersistedStateIntoRedux(s: OnBrowserState) {
    this.internalProject.reduxStore.dispatch(
      this.internalProject._actions.historic.__unsafe_replaceHistory(s.projectHistory),
    )
  }

  async _startPersisting() {
    const {atomP} = this.internalProject
    const ephemeralStateP = atomP.ephemeral
    const diskRevisionsThatBrowserStateIsBasedOnP = (this.internalProject._selectors.ephemeral.getDiskRevisionsBrowserStateIsBasedOn(
      ephemeralStateP,
    ) as $IntentionalAny) as Pointer<string[]>

    const stateOfInterestD = autoDerive(() => {
      return {
        basedOnRevisions: val(diskRevisionsThatBrowserStateIsBasedOnP),
        projectHistory: val(atomP.historic['@@history']),
      }
    })
    let persistScheduled = false
    const persist = () => {
      persistScheduled = false
      const v = stateOfInterestD.getValue()
      persistOnBrowser(this._storageKey, v)
    }

    const debouncedPersist = debounce(persist, 500)
    stateOfInterestD.changesWithoutValues().tap(() => {
      persistScheduled = true
      debouncedPersist()
    })
    if (window) {
      window.addEventListener('beforeunload', () => {
        if (persistScheduled) {
          persist()
        }
      })
    }
  }
}

const getBrowserPersistedState = (
  storageKey: string,
): undefined | OnBrowserState => {
  const persistedS = localStorage.getItem(storageKey)
  if (persistedS) {
    let persistedObj
    try {
      persistedObj = JSON.parse(persistedS)
      return persistedObj
    } catch (e) {
      return
    }
  }
  return undefined
}

const persistOnBrowser = (storageKey: string, state: OnBrowserState) => {
  const string = JSON.stringify(state)
  localStorage.setItem(storageKey, string)
}

export const validateOnDiskState = (internalProject: InternalProject, s: OnDiskState) => {
  if (
    Array.isArray(s) ||
    s == null ||
    s.definitionVersion !== $env.tl.currentProjectStateDefinitionVersion
  ) {
    throw new Error(
      `Error validating conf.state in new Project(${JSON.stringify(
        internalProject.id,
      )}, conf). The state seems to be formatted in a way that is unreadable to TheatreJS.`,
    )
  }
}
