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
import atomFromReduxStore from '$shared/utils/redux/atomFromReduxStore';

export default class Project {
  static version = process.env.tl.version
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

  /**
   * @todo should we have a human-readable name for each project too?
   */
  constructor(readonly id: string) {
    projectsSingleton.add(id, this)
    this.adapters = new NativeObjectAdaptersManager(this)
    this.reduxStore = configureStore({rootReducer})
    this.atom = atomFromReduxStore(this.reduxStore)
    this.atomP = this.atom.pointer
    this.ticker = new Ticker()
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
}
