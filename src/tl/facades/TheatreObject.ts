import TimelineInstanceObject from '$tl/objects/TimelineInstanceObject'
import {VoidFn} from '$shared/types'
import {OnValuesChangeCallback} from '../objects/TimelineInstanceObject'
import userReadableTypeOfValue from '$shared/utils/userReadableTypeOfValue'
import noop from '$shared/utils/noop'

const theWeakmap = new WeakMap<
TheatreObject,
  TimelineInstanceObject
>()

const realInstance = (s: TheatreObject) =>
  theWeakmap.get(s) as TimelineInstanceObject

export default class TheatreObject {
  constructor(timelineInstance: TimelineInstanceObject) {
    theWeakmap.set(this, timelineInstance)
  }

  get name() {
    return realInstance(this).path
  }

  get nativeObject() {
    return realInstance(this).nativeObject
  }

  get currentValues() {
    return realInstance(this).currentValues
  }

  onValuesChange(callback: OnValuesChangeCallback): VoidFn {
    if (!$env.tl.isCore) {
      if (typeof callback !== 'function') {
        console.warn(
          `The callback argument in object.onValuesChange(callback) must be a function. Instead ${userReadableTypeOfValue(
            callback,
          )} was given. Lean more about how to use object.onValuesChange() at https://theatrejs.com/docs/objects.html#onValuesChange`,
        )
        return noop
      }
    }
    const unsubscribe = realInstance(this).onValuesChange(callback)
    if ($env.tl.isCore) {
      return unsubscribe
    } else {
      let didUnsubscribe = false
      return () => {
        if (!didUnsubscribe) {
          unsubscribe()
          didUnsubscribe = true
        } else {
          console.warn(
            `The unsubscribe() function returned from object.onValuesChange() has already been called once. ` +
              `Lean more about how to use object.onValuesChange() at https://theatrejs.com/docs/objects.html#onValuesChange`,
          )
        }
      }
    }
  }
}
