import projectsSingleton from './projectsSingleton'
import TimelineInstance from '$tl/timelines/TimelineInstance'
import InternalTimeline from '$tl/timelines/InternalTimeline'
import {validateAndSanitiseSlashedPathOrThrow} from '$tl/handy/slashedPaths'
import NativeObjectAdaptersManager from '$tl/nativeObjectAdapters/NativeObjectAdaptersManager'
import {Atom} from '$shared/DataVerse2/atom'
import {rootReducer, projectActions} from './store'
import {ProjectState} from './store/types'
import {Store} from 'redux'
import {Pointer} from '$shared/DataVerse2/pointer'
import Ticker from '$shared/DataVerse/Ticker'
import configureStore from '$shared/utils/redux/configureStore'
import atomFromReduxStore from '$shared/utils/redux/atomFromReduxStore'
import {ProjectAddress} from '$tl/handy/addresses'
import projectSelectors from '$tl/Project/store/selectors'
import {GenericAction} from '$shared/types'
import {debounce} from 'lodash-es'

const storageKey = 'storageKey'

export default class Project {
  static version = $env.tl.version
  _timelineInstances: Atom<{
    [path: string]: {[instanceId: string]: TimelineInstance}
  }> = new Atom({})

  _internalTimelines: Atom<{
    [path: string]: InternalTimeline
  }> = new Atom({})

  atom: Atom<ProjectState>
  reduxStore: Store<ProjectState>
  _enabled = false
  atomP: Pointer<ProjectState>
  ticker: Ticker

  adapters: NativeObjectAdaptersManager
  _actions = projectActions
  _address: ProjectAddress

  _selectors = projectSelectors

  /**
   * @todo should we have a human-readable name for each project too?
   */
  constructor(readonly id: string) {
    projectsSingleton.add(id, this)
    this.adapters = new NativeObjectAdaptersManager(this)
    this.reduxStore = configureStore({
      rootReducer,
      devtoolsOptions: {
        name: 'TheaterJS Project ' + id,
      },
    })
    this.atom = atomFromReduxStore(this.reduxStore)
    this.atomP = this.atom.pointer
    this.ticker = new Ticker()
    this._address = {projectId: this.id}

    const onAnimationFrame = (t: number) => {
      this.ticker.tick(t)
      window.requestAnimationFrame(onAnimationFrame)
    }
    window.requestAnimationFrame(onAnimationFrame)

    this._startPersisting()
  }

  getTimeline(_path: string, instanceId: string = 'default'): TimelineInstance {
    const path = validateAndSanitiseSlashedPathOrThrow(
      _path,
      'project.getTimeline',
    )

    let instance = this._timelineInstances.getIn([path, instanceId])
    if (!instance) {
      instance = new TimelineInstance(this, path, instanceId)

      this._timelineInstances.reduceState([path], (existingInstances = {}) => ({
        ...existingInstances,
        [instanceId]: instance,
      }))
    }

    return instance
  }

  _getInternalTimeline(path: string): InternalTimeline {
    let internalTimeline = this._internalTimelines.getState()[path]
    if (!internalTimeline) {
      internalTimeline = new InternalTimeline(this, path)
      this._internalTimelines.reduceState([path], () => internalTimeline)
    }

    return internalTimeline
  }

  _dispatch(...actions: GenericAction[]) {
    return this.reduxStore.dispatch(this._actions.batched(actions))
  }

  _startPersisting() {
    this._loadState()
    let lastHistory = this.reduxStore.getState().historic['@@history']
    this.reduxStore.subscribe(
      debounce(() => {
        const newHistory = this.reduxStore.getState().historic['@@history']
        if (newHistory === lastHistory) return
        lastHistory = newHistory
        localStorage.setItem(storageKey, JSON.stringify(newHistory))
      }, 1000),
    )
  }

  _loadState() {
    const persistedS = localStorage.getItem(storageKey)
    if (persistedS) {
      let persistedObj
      try {
        persistedObj = JSON.parse(persistedS)
      } catch (e) {
        return
      }
      this._dispatch(
        this._actions.historic.__unsafe_replaceHistory(persistedObj),
      )
    }
  }
}
