import TimelineInstance, {
  PlaybackRange,
  PlaybackDirection,
} from '$tl/timelines/TimelineInstance'
import {
  NativeObjectTypeConfig,
  getAdapterOfNativeObject,
} from '$tl/objects/objectTypes'
import {validateAndSanitiseSlashedPathOrThrow} from '$tl/handy/slashedPaths'
import {InvalidArgumentError} from '../handy/errors'
import {sanitizeAndValidateTypeFromAdapter} from '$tl/facades/propSanitizers'
import {sanitizeAndValidateHardCodedProps} from './propSanitizers'

const theWeakmap = new WeakMap<TheatreJSTimelineInstance, TimelineInstance>()
const realInstance = (s: TheatreJSTimelineInstance) =>
  theWeakmap.get(s) as TimelineInstance

export default class TheatreJSTimelineInstance {
  constructor(timelineInstance: TimelineInstance) {
    theWeakmap.set(this, timelineInstance)
  }

  get time() {
    return realInstance(this).time
  }

  set time(t: number) {
    realInstance(this).time = t
  }

  get playing() {
    return realInstance(this).playing
  }

  play(
    conf?: Partial<{
      iterationCount: number
      range: PlaybackRange
      rate: number
      direction: PlaybackDirection
    }>,
  ) {
    realInstance(this).play(conf)
  }

  createObject(
    _path: string,
    nativeObject: $FixMe,
    _config?: NativeObjectTypeConfig,
  ) {
    const inst = realInstance(this)
    const path = validateAndSanitiseSlashedPathOrThrow(
      _path,
      'timeline.createObject',
    )
    if (inst._objects[path]) {
      throw new InvalidArgumentError(
        `Looks like you're creating two different objects on the same path "${path}". If you're trying to create two different objects, give each a unique path. Otherwise if you're trying to query the same existing object, you can run timeline.getObject(path) to get access to that object after it's been created.`,
      )
    }

    const sanitisedConfig: NativeObjectTypeConfig = _config
      ? {..._config}
      : {props: {}}

    let type = sanitisedConfig

    if (_config && _config.hasOwnProperty('props')) {
      type.props = sanitizeAndValidateHardCodedProps(_config.props, _path)
    } else {
      const possibleAdapter = getAdapterOfNativeObject(
        inst._project,
        nativeObject,
        sanitisedConfig,
      )
      if (!possibleAdapter) {
        type.props = {}
        if (!$env.tl.isCore) {
          console.warn(
            `Object "${path}" in timeline.createObject("${path}", ...) is not accepted by any adapters, nor does it have props. Learn how to set props on objects at https://theatrejs.com/docs/props.html`,
          )
        }
      } else {
        type = possibleAdapter.getType(nativeObject, sanitisedConfig)
        if (!$env.tl.isCore) {
          type = sanitizeAndValidateTypeFromAdapter(type, possibleAdapter)
        }
      }
    }

    const object = inst.createObject(path, nativeObject, sanitisedConfig, type)
    return object.facade
  }

  pause() {
    realInstance(this).pause()
  }
}
