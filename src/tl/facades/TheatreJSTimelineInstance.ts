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
import {defer} from '../../shared/utils/defer'

const theWeakmap = new WeakMap<TheatreJSTimelineInstance, TimelineInstance>()
const realInstance = (s: TheatreJSTimelineInstance) =>
  theWeakmap.get(s) as TimelineInstance

export default class TheatreJSTimelineInstance {
  constructor(timelineInstance: TimelineInstance) {
    theWeakmap.set(this, timelineInstance)
  }

  get time() {
    return realInstance(this).time / 1000
  }

  set time(t: number) {
    realInstance(this).time = t * 1000
  }

  get playing() {
    return realInstance(this).playing
  }

  createObject(
    _path: string,
    nativeObject: $FixMe,
    _config?: NativeObjectTypeConfig,
  ) {
    const inst = realInstance(this)
    const path = validateAndSanitiseSlashedPathOrThrow(
      _path,
      `timeline.createObject("${_path}", ...)`,
    )
    if (inst._objects[path]) {
      throw new InvalidArgumentError(
        `Looks like you're creating two different objects on the same path "${path}". ` +
          `If you're trying to create two different objects, give each a unique path. ` +
          `Otherwise if you're trying to query the same existing object, you can run` +
          ` timeline.getObject(path) to get access to that object after it's been created.`,
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
            `Object "${path}" in timeline.createObject("${path}", ...) is not accepted by ` +
              `any adapters, nor does it have props. Learn how to set props on objects at ` +
              `https://theatrejs.com/docs/props.html`,
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

  getObject(_path: string) {
    const path = validateAndSanitiseSlashedPathOrThrow(
      _path,
      `timeline.getObject("${_path}")`,
    )
    const possibleObject = realInstance(this).getObject(path)
    return possibleObject ? possibleObject.facade : undefined
  }

  /**
   * Starts playback of a timeline.
   * Returns a promise that either resolves to true when the playback completes,
   * or resolves to false if playback gets interrupted (for example by calling timeline.pause())
   */
  play(
    conf?: Partial<{
      iterationCount: number
      range: PlaybackRange
      rate: number
      direction: PlaybackDirection
    }>,
  ) {
    if (realInstance(this)._project.isReady()) {
      return realInstance(this).play(conf)
    } else {
      if (!$env.tl.isCore) {
        console.warn(
          `You seem to have called timeline.play() before the project has finished loading.\n` +
            `This would not a problem in production when using 'theatre/core', since Theatre loads instantly in core mode. ` +
            `However, when using Theatre's UI, it takes a few milliseconds for it to load your animation data, ` +
            `before which your timelines cannot start playing.\n` +
            `\n` +
            `To fix this, simply defer calling timeline.play() until after the project is loaded, like this:\n` +
            `project.ready.then(() => {\n` +
            `  timeline.play()\n` +
            `})`,
        )
      }
      const d = defer()
      d.resolve(true)
      return d.promise
    }
  }

  pause() {
    realInstance(this).pause()
  }
}
