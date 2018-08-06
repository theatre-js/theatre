import projectsSingleton from './projectsSingleton'
import TimelineInstance from '$tl/timelines/TimelineInstance'
import InternalTimeline from '$tl/timelines/InternalTimeline'
import {validateAndSanitiseSlashedPathOrThrow} from '$tl/handy/slashedPaths'
import NativeObjectAdaptersManager from '$tl/nativeObjectAdapters/NativeObjectAdaptersManager'
import {Atom} from '$shared/DataVerse2/atom'

export default class Project {
  static version = process.env.tl.version
  _timelineInstances: Atom<{
    [path: string]: {[instanceId: string]: TimelineInstance}
  }> = new Atom({})

  _internalTimelines: Atom<{
    [path: string]: InternalTimeline
  }> = new Atom({})

  adapters: NativeObjectAdaptersManager

  /**
   * @todo should we have a human-readable name for each project too?
   */
  constructor(readonly id: string) {
    projectsSingleton.add(id, this)
    this.adapters = new NativeObjectAdaptersManager(this)
  }

  getTimeline(_path: string, instanceId: string = 'default'): TimelineInstance {
    const path = validateAndSanitiseSlashedPathOrThrow(
      _path,
      'project.getTimeline',
    )

    let instance = this._timelineInstances.getIn([path, instanceId])
    if (!instance) {
      instance = new TimelineInstance(this, path, instanceId)
      this._timelineInstances.reduceState([path, instanceId], () => instance)
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
