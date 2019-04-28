import TimelineInstance, {
  PlaybackRange,
  PlaybackDirection,
} from '$tl/timelines/TimelineInstance'
import {
  NativeObjectTypeConfig,
  getAdapterOfNativeObject,
} from '$tl/objects/objectTypes'
import {validateAndSanitiseSlashedPathOrThrow} from '$tl/handy/slashedPaths'
import {sanitizeAndValidateTypeFromAdapter} from '$tl/facades/propSanitizers'
import {sanitizeAndValidateHardCodedProps} from './propSanitizers'
import {defer} from '../../shared/utils/defer'
import userReadableTypeOfValue from '$shared/utils/userReadableTypeOfValue'

type GetObjectConfig = NativeObjectTypeConfig

const theWeakmap = new WeakMap<TheatreTimeline, TimelineInstance>()
const realInstance = (s: TheatreTimeline) =>
  theWeakmap.get(s) as TimelineInstance

export default class TheatreTimeline {
  constructor(timelineInstance: TimelineInstance) {
    theWeakmap.set(this, timelineInstance)
  }

  get time() {
    return realInstance(this).time
  }

  set time(t: number) {
    if (typeof t !== 'number') {
      console.error(
        `timeline.time = t must be a number. ${userReadableTypeOfValue(
          t,
        )} given.`,
      )
      return
    } else if (t < 0) {
      console.error(`timeline.time = t must be a positive number. ${t} given.`)
      return
    } else if (isNaN(t)) {
      console.error(`timeline.time = t must be a real number. NaN given.`)
      return
    }
    realInstance(this).time = t
  }

  get playing() {
    return realInstance(this).playing
  }

  getObject(_path: string, nativeObject: $FixMe, __config?: GetObjectConfig) {
    const inst = realInstance(this)
    const path = validateAndSanitiseSlashedPathOrThrow(
      _path,
      `timeline.getObject("${_path}", ...)`,
    )

    const {..._config} = __config || ({} as GetObjectConfig)

    const providedConfigOrEmptyConfig: NativeObjectTypeConfig = _config
      ? {..._config}
      : {props: {}}

    let finalConfig = providedConfigOrEmptyConfig

    if (_config && _config.hasOwnProperty('props')) {
      if (!$env.tl.isCore) {
        finalConfig.props = sanitizeAndValidateHardCodedProps(
          _config.props,
          _path,
        )
      }
    } else {
      const possibleAdapter = getAdapterOfNativeObject(
        inst._project,
        nativeObject,
        providedConfigOrEmptyConfig,
      )
      if (!possibleAdapter) {
        finalConfig.props = {}
        if (!$env.tl.isCore) {
          console.warn(
            `When calling \`timeline.getObject("${path}", ...)\`, you did not provide any props. ` +
              `We also couldn't find any adapters that could handle this object, so we could ` +
              `not determine the type of its props.\n ` +
              `Learn how to set props on objects at ` +
              `https://theatrejs.com/docs/props.html`,
          )
        }
      } else {
        finalConfig = possibleAdapter.getConfig(
          nativeObject,
          providedConfigOrEmptyConfig,
        )
        if (!$env.tl.isCore) {
          finalConfig = sanitizeAndValidateTypeFromAdapter(
            finalConfig,
            possibleAdapter,
          )
        }
      }
    }

    const existingObject = inst._objects[path]

    if (existingObject) {
      existingObject.override(
        nativeObject,
        providedConfigOrEmptyConfig,
        finalConfig,
      )
      return existingObject.facade
    } else {
      const object = inst.createObject(
        path,
        nativeObject,
        providedConfigOrEmptyConfig,
        finalConfig,
      )
      return object.facade
    }
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
            `This would **not** a problem in production when using 'theatre/core', since Theatre loads instantly in core mode. ` +
            `However, when using Theatre's UI, it takes a few milliseconds for it to load your project's state, ` +
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
