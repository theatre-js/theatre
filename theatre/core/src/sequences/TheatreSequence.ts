import logger from '@theatre/shared/logger'
import {privateAPI, setPrivateAPI} from '@theatre/core/privateAPIs'
import {defer} from '@theatre/shared/utils/defer'
import type Sequence from './Sequence'
import type {IPlaybackDirection, IPlaybackRange} from './Sequence'
import AudioPlaybackController from './playbackControllers/AudioPlaybackController'
import coreTicker from '@theatre/core/coreTicker'

interface IAttachAudioArgs {
  /**
   * Either a URL to the audio file (eg "https://localhost/audio.mp3") or an instance of AudioBuffer
   */
  source: string | AudioBuffer
  /**
   * An optional AudioContext. If not provided, one will be created.
   */
  audioContext?: AudioContext
  /**
   * An AudioDestinationNode to feed the audio into. One will be created if not provided.
   */
  destinationNode?: AudioDestinationNode
}

export interface ISequence {
  readonly type: 'Theatre_Sequence_PublicAPI'

  /**
   * Starts playback of a sequence.
   * Returns a promise that either resolves to true when the playback completes,
   * or resolves to false if playback gets interrupted (for example by calling sequence.pause())
   */
  play(conf?: {
    /**
     * The number of times the animation must run. Must be an integer larger
     * than 0. Defaults to 1. Pick Infinity to run forever
     */
    iterationCount?: number
    /**
     * Limits the range to be played. Default is [0, sequence.length]
     */
    range?: IPlaybackRange
    /**
     * The playback rate. Defaults to 1. Choosing 2 would play the animation
     * at twice the speed.
     */
    rate?: number
    /**
     * The direction of the playback. Similar to CSS's animation-direction
     */
    direction?: IPlaybackDirection
  }): Promise<boolean>

  /**
   * Pauses the currently playing animation
   */
  pause(): void

  /**
   * The current position of the playhead.
   * In a time-based sequence, this represents the current time.
   */
  position: number

  /**
   *
   * @param args
   */
  attachAudio(args: IAttachAudioArgs): Promise<void>
}

export default class TheatreSequence implements ISequence {
  get type(): 'Theatre_Sequence_PublicAPI' {
    return 'Theatre_Sequence_PublicAPI'
  }

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

  get position() {
    return privateAPI(this).position
  }

  set position(position: number) {
    privateAPI(this).position = position
  }

  async attachAudio(args: IAttachAudioArgs): Promise<void> {
    const {audioContext, destinationNode, decodedBuffer} =
      await resolveAudioBuffer(args)

    const playbackController = new AudioPlaybackController(
      coreTicker,
      decodedBuffer,
      audioContext,
      destinationNode,
    )

    privateAPI(this).replacePlaybackController(playbackController)
  }
}

async function resolveAudioBuffer(args: IAttachAudioArgs): Promise<{
  decodedBuffer: AudioBuffer
  audioContext: AudioContext
  destinationNode: AudioDestinationNode
}> {
  const audioContext = args.audioContext || new AudioContext()

  const decodedBufferDeferred = defer<AudioBuffer>()
  if (args.source instanceof AudioBuffer) {
    decodedBufferDeferred.resolve(args.source)
  } else if (typeof args.source !== 'string') {
    throw new Error(
      `Error validating arguments to sequence.attachAudio(). ` +
        `args.source must either be a string or an instance of AudioBuffer.`,
    )
  } else {
    let fetchResponse
    try {
      fetchResponse = await fetch(args.source)
    } catch (e) {
      console.error(e)
      throw new Error(
        `Could not fetch '${args.source}'. Network error logged above.`,
      )
    }

    let buffer
    try {
      buffer = await fetchResponse.arrayBuffer()
    } catch (e) {
      console.error(e)
      throw new Error(`Could not read '${args.source}' as an arrayBuffer.`)
    }

    audioContext.decodeAudioData(
      buffer,
      decodedBufferDeferred.resolve,
      decodedBufferDeferred.reject,
    )
  }

  let decodedBuffer
  try {
    decodedBuffer = await decodedBufferDeferred.promise
  } catch (e) {
    console.error(e)
    throw new Error(`Could not decode ${args.source} as an audio file.`)
  }

  const destinationNode = args.destinationNode || audioContext.destination

  return {
    destinationNode,
    audioContext,
    decodedBuffer,
  }
}
