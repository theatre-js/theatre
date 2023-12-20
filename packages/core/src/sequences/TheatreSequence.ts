import {privateAPI, setPrivateAPI} from '@theatre/core/privateAPIs'
import {defer} from '@theatre/utils/defer'
import type Sequence from './Sequence'
import AudioPlaybackController from './playbackControllers/AudioPlaybackController'
import {getCoreTicker} from '@theatre/core/coreTicker'
import type {Pointer} from '@theatre/dataverse'
import {notify} from '@theatre/core/utils/notify'
import type {
  IAttachAudioArgs,
  IPlaybackDirection,
  IPlaybackRange,
  ISequence,
  IRafDriver,
  BasicKeyframe,
} from '@theatre/core/types/public'

export default class TheatreSequence implements ISequence {
  get type(): 'Theatre_Sequence_PublicAPI' {
    return 'Theatre_Sequence_PublicAPI'
  }

  /**
   * @internal
   */
  constructor(seq: Sequence) {
    setPrivateAPI(this, seq)
  }

  play(
    conf?: Partial<{
      iterationCount: number
      range: IPlaybackRange
      rate: number
      direction: IPlaybackDirection
      rafDriver: IRafDriver
    }>,
  ): Promise<boolean> {
    const priv = privateAPI(this)
    if (priv._project.isReady()) {
      const ticker = conf?.rafDriver
        ? privateAPI(conf.rafDriver).ticker
        : getCoreTicker()
      return priv.play(conf ?? {}, ticker)
    } else {
      if (process.env.NODE_ENV !== 'production') {
        notify.warning(
          "Sequence can't be played",
          'You seem to have called `sequence.play()` before the project has finished loading.\n\n' +
            'This would **not** a problem in production when using `@theatre/core`, since Theatre.js loads instantly in core mode. ' +
            "However, when using `@theatre/studio`, it takes a few milliseconds for it to load your project's state, " +
            `before which your sequences cannot start playing.\n` +
            `\n` +
            'To fix this, simply defer calling `sequence.play()` until after the project is loaded, like this:\n\n' +
            '```\n' +
            `project.ready.then(() => {\n` +
            `  sequence.play()\n` +
            `})\n` +
            '```',
          [
            {
              url: 'https://www.theatrejs.com/docs/0.5/api/core#project.ready',
              title: 'Project.ready',
            },
          ],
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

  __experimental_getKeyframes(prop: Pointer<any>): BasicKeyframe[] {
    return privateAPI(this).getKeyframesOfSimpleProp(prop)
  }

  async attachAudio(args: IAttachAudioArgs): Promise<{
    decodedBuffer: AudioBuffer
    audioContext: AudioContext
    destinationNode: AudioNode
    gainNode: GainNode
  }> {
    const {audioContext, destinationNode, decodedBuffer, gainNode} =
      await resolveAudioBuffer(args)

    const playbackController = new AudioPlaybackController(
      decodedBuffer,
      audioContext,
      gainNode,
    )

    privateAPI(this).replacePlaybackController(playbackController)

    return {audioContext, destinationNode, decodedBuffer, gainNode}
  }

  get pointer(): ISequence['pointer'] {
    return privateAPI(this).pointer
  }
}

async function resolveAudioBuffer(args: IAttachAudioArgs): Promise<{
  decodedBuffer: AudioBuffer
  audioContext: AudioContext
  destinationNode: AudioNode
  gainNode: GainNode
}> {
  function getAudioContext(): Promise<AudioContext> {
    if (args.audioContext) return Promise.resolve(args.audioContext)
    const ctx = new AudioContext()
    if (ctx.state === 'running') return Promise.resolve(ctx)

    // AudioContext is suspended, probably because the browser
    // has blocked it since it is not initiated by a user gesture

    // if in SSR, just resolve the promise, as there is not much more to be done
    if (typeof window === 'undefined') {
      return Promise.resolve(ctx)
    }
    return new Promise<AudioContext>((resolve) => {
      const listener = () => {
        ctx.resume().catch((err) => {
          console.error(err)
        })
      }

      const eventsToHookInto: Array<keyof WindowEventMap> = [
        'mousedown',
        'keydown',
        'touchstart',
      ]

      const eventListenerOpts = {capture: true, passive: false}
      eventsToHookInto.forEach((eventName) => {
        window.addEventListener(eventName, listener, eventListenerOpts)
      })

      ctx.addEventListener('statechange', () => {
        if (ctx.state === 'running') {
          eventsToHookInto.forEach((eventName) => {
            window.removeEventListener(eventName, listener, eventListenerOpts)
          })
          resolve(ctx)
        }
      })
    })
  }

  async function getAudioBuffer(): Promise<AudioBuffer> {
    if (args.source instanceof AudioBuffer) {
      return args.source
    }

    const decodedBufferDeferred = defer<AudioBuffer>()
    if (typeof args.source !== 'string') {
      throw new Error(
        `Error validating arguments to sequence.attachAudio(). ` +
          `args.source must either be a string or an instance of AudioBuffer.`,
      )
    }

    let fetchResponse
    try {
      fetchResponse = await fetch(args.source)
    } catch (e) {
      console.error(e)
      throw new Error(
        `Could not fetch '${args.source}'. Network error logged above.`,
      )
    }

    let arrayBuffer
    try {
      arrayBuffer = await fetchResponse.arrayBuffer()
    } catch (e) {
      console.error(e)
      throw new Error(`Could not read '${args.source}' as an arrayBuffer.`)
    }

    const audioContext = await audioContextPromise

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    audioContext.decodeAudioData(
      arrayBuffer,
      decodedBufferDeferred.resolve,
      decodedBufferDeferred.reject,
    )

    let decodedBuffer
    try {
      decodedBuffer = await decodedBufferDeferred.promise
    } catch (e) {
      console.error(e)
      throw new Error(`Could not decode ${args.source} as an audio file.`)
    }

    return decodedBuffer
  }

  const audioContextPromise = getAudioContext()
  const audioBufferPromise = getAudioBuffer()

  const [audioContext, decodedBuffer] = await Promise.all([
    audioContextPromise,
    audioBufferPromise,
  ])

  const destinationNode = args.destinationNode || audioContext.destination
  const gainNode = audioContext.createGain()
  gainNode.connect(destinationNode)

  return {
    audioContext,
    decodedBuffer,
    gainNode,
    destinationNode,
  }
}
