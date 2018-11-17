import projectsSingleton from './projectsSingleton'
import TimelineInstance from '$tl/timelines/TimelineInstance'
import TimelineTemplate from '$tl/timelines/TimelineTemplate'
import NativeObjectAdaptersManager from '$tl/nativeObjectAdapters/NativeObjectAdaptersManager'
import {Atom} from '$shared/DataVerse/atom'
import {rootReducer, projectActions} from './store'
import {ProjectState} from './store/types'
import {Store} from 'redux'
import {Pointer} from '$shared/DataVerse/pointer'
import Ticker from '$shared/DataVerse/Ticker'
import configureStore from '$shared/utils/redux/configureStore'
import atomFromReduxStore from '$shared/utils/redux/atomFromReduxStore'
import {ProjectAddress} from '$tl/handy/addresses'
import projectSelectors from '$tl/Project/store/selectors'
import {GenericAction} from '$shared/types'
import ProjectPersistor from './ProjectPersistor'
import {OnDiskState} from '$tl/Project/store/types'
import resolvedPromise from '$shared/utils/resolvedPromise'
import TheatreJSProject from '../facades/TheatreJSProject'

export type Conf = Partial<{
  state: OnDiskState
}>

export default class Project {
  static version = $env.version
  _timelineInstances: Atom<{
    [path: string]: {[instanceId: string]: TimelineInstance}
  }> = new Atom({})

  _timelineTemplates: Atom<{
    [path: string]: TimelineTemplate
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
  protected _persistor: ProjectPersistor
  _readyPromise: Promise<void>
  _isReady: boolean = false

  /**
   * @todo should we have a human-readable name for each project too?
   */
  constructor(readonly id: string, readonly config: Conf = {}, readonly facade: TheatreJSProject) {
    projectsSingleton.add(id, this)
    this.adapters = new NativeObjectAdaptersManager(this)
    this.reduxStore = configureStore({
      rootReducer,
      devtoolsOptions: {
        name: 'Theatre.js Project ' + id,
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
    if (!$env.tl.isCore) {
      this._persistor = new ProjectPersistor(this)
      this._readyPromise = new Promise(resolve => {
        const check = () => {
          const ephemeralState = this.reduxStore.getState().ephemeral
          if (this._selectors.ephemeral.isReady(ephemeralState)) {
            unsubscribe()
            this._isReady = true
            resolve()
          }
        }
        const unsubscribe = this.reduxStore.subscribe(check)
        check()
      })
    } else {
      const onDiskState = this.config.state!
      this._dispatch(
        this._actions.historic.__unsafe_clearHistoryAndReplaceInnerState(
          onDiskState.projectState,
        ),
        this._actions.ephemeral.setLoadingStateToLoaded({
          diskRevisionsThatBrowserStateIsBasedOn: [onDiskState.revision],
        }),
      )
      this._isReady = true
      this._readyPromise = resolvedPromise
    }
  }

  getTimeline(path: string, instanceId: string = 'default'): TimelineInstance {
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

  _getTimelineTemplate(path: string): TimelineTemplate {
    let timelineTemplate = this._timelineTemplates.getState()[path]
    if (!timelineTemplate) {
      timelineTemplate = new TimelineTemplate(this, path)
      this._timelineTemplates.reduceState([path], () => timelineTemplate)
    }

    return timelineTemplate
  }

  _dispatch(...actions: GenericAction[]) {
    return this.reduxStore.dispatch(this._actions.batched(actions))
  }

  get ready() {
    return this._readyPromise
  }

  isReady() {
    return this._isReady
    // return this._selectors.ephemeral.isReady(
    //   this.reduxStore.getState().ephemeral,
    // )
  }
}
