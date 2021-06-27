import logger from '@theatre/shared/logger'
import {privateAPI, setPrivateAPI} from '@theatre/core/privateAPIs'
import {defer} from '@theatre/shared/utils/defer'
import type Sequence from './Sequence'
import type {IPlaybackDirection, IPlaybackRange} from './Sequence'

export interface ISequence {
  /**
   * Starts playback of a sequence.
   * Returns a promise that either resolves to true when the playback completes,
   * or resolves to false if playback gets interrupted (for example by calling sequence.pause())
   */
  play(
    conf?: Partial<{
      iterationCount: number
      range: IPlaybackRange
      rate: number
      direction: IPlaybackDirection
    }>,
  ): Promise<boolean>

  pause(): void

  time: number
}

export default class TheatreSequence {
  /**
   * @internal
   */
  constructor(sheet: Sequence) {
    setPrivateAPI(this, sheet)
  }

  play(
    conf?: Partial<{
      iterationCount: number
      range: IPlaybackRange
      rate: number
      direction: IPlaybackDirection
    }>,
  ): Promise<boolean> {
    if (privateAPI(this)._project.isReady()) {
      return privateAPI(this).play(conf)
    } else {
      if (process.env.NODE_ENV !== 'production') {
        logger.warn(
          `You seem to have called sequence.play() before the project has finished loading.\n` +
            `This would **not** a problem in production when using '@theatre/core', since Theatre loads instantly in core mode. ` +
            `However, when using '@theatre/studio', it takes a few milliseconds for it to load your project's state, ` +
            `before which your sequences cannot start playing.\n` +
            `\n` +
            `To fix this, simply defer calling sequence.play() until after the project is loaded, like this:\n` +
            `project.ready.then(() => {\n` +
            `  sequence.play()\n` +
            `})`,
        )
      }
      const d = defer<boolean>()
      d.resolve(true)
      return d.promise
    }
  }

  pause() {
    privateAPI(this).pause()
  }

  get time() {
    return privateAPI(this).position
  }

  set time(t: number) {
    privateAPI(this).position = t
  }
}
