import TimelineInstanceObject from '$tl/objects/TimelineInstanceObject'

const theWeakmap = new WeakMap<
  TheatreJSTimelineInstanceObject,
  TimelineInstanceObject
>()

const realInstance = (s: TheatreJSTimelineInstanceObject) =>
  theWeakmap.get(s) as TimelineInstanceObject

export default class TheatreJSTimelineInstanceObject {
  constructor(timelineInstance: TimelineInstanceObject) {
    theWeakmap.set(this, timelineInstance)
  }
}
