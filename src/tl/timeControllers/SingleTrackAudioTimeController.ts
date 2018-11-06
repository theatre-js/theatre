import Emitter from '$shared/DataVerse/utils/Emitter'

export default class SingleTrackWithAudioApi {
  _destination: $FixMe
  context: AudioContext
  node: GainNode
  _currentSource: AudioBufferSourceNode | null
  _actualT: number
  _lastWindowTime: number
  duration: number
  _trackDuration: number
  _requestedDuration: number
  _waitBeforePlay: number
  _isReady: boolean
  _isPlaying: boolean
  _isSet: boolean
  _offset: number
  req: XMLHttpRequest
  decodedBuffer: AudioBuffer
  events = {
    readyStateChange: new Emitter<void>(),
    durationChange: new Emitter<void>(),
    tick: new Emitter<void>(),
    pause: new Emitter<void>(),
    play: new Emitter<void>(),
  }
  t: number
  constructor(destination: $FixMe) {
    // setup the audio stuff
    if (destination.context != null) {
      this.context = destination.context
    } else {
      this.context = destination
      destination = this.context.destination
    }
    this.node = this.context.createGain()
    this.node.connect(destination)
    this._currentSource = null
    this._actualT = 0.0
    this._lastWindowTime = 0.0
    this.duration = 0.0
    this._trackDuration = 0.0
    this._requestedDuration = 0.0
    this._waitBeforePlay = 50
    this._isReady = false
    this._isPlaying = false
    this._isSet = false
    this._offset = 0.0
  }

  setOffset(offset: number) {
    return (this._offset = +offset)
  }

  set(url: string) {
    if (this._isSet) {
      throw Error('Another track is already set')
    }
    this._isSet = true
    const req = (this.req = new XMLHttpRequest())
    req.open('GET', url, true)
    req.responseType = 'arraybuffer'
    req.send()
    req.addEventListener('load', () => {
      this.context.decodeAudioData(req.response, success, failure)
    })
    const success = (decoded: AudioBuffer) => {
      this.decodedBuffer = decoded
      return this._getReady()
    }
    const failure = () => {
      return console.error('Unable to decode audio data')
    }
  }

  _getReady() {
    if (this._isReady) {
      return
    }
    this._trackDuration = this.decodedBuffer.duration * 1000.0
    this._updateDuration()
    this._isReady = true
    this.events.readyStateChange.emit(void 0)
  }

  _updateDuration() {
    var newDuration
    newDuration = Math.max(this._requestedDuration, this._trackDuration)
    if (newDuration !== this.duration) {
      this.duration = newDuration
      this.events.durationChange.emit(void 0)
    }
  }

  maximizeDuration(duration: number) {
    this._requestedDuration = duration
    return this._updateDuration()
  }

  isPlaying() {
    return this._isPlaying
  }

  isReady() {
    return this._isReady
  }

  _actualTToUserT(actualT: number) {
    return actualT + this._offset
  }

  _userTToActualT(userT: number) {
    return userT - this._offset
  }

  _setT(actual: number) {
    this._actualT = actual
    this.t = this._actualTToUserT(actual)
  }

  tick() {
    var currentWindowTime
    if (!this._isPlaying) {
      return
    }
    currentWindowTime = performance.now()
    this._setT(this._actualT + currentWindowTime - this._lastWindowTime)
    this._lastWindowTime = currentWindowTime
    if (this._actualT > this.duration) {
      this.pause()
      this.seekTo(0.0)
      return
    }
    this.events.tick.emit(void 0)
  }

  play() {
    if (this._isPlaying) {
      return
    }
    if (this._isReady) {
      this._play()
    }
  }

  togglePlay() {
    if (this._isPlaying) {
      return this.pause()
    } else {
      return this.play()
    }
  }

  pause() {
    if (!this._isPlaying) {
      return
    }
    this._unqueue()
    this._isPlaying = false
    this.events.pause.emit(void 0)
  }

  seekTo(t: number) {
    var wasPlaying
    t = this._userTToActualT(t)
    if (this._isPlaying) {
      wasPlaying = true
      this.pause()
    }
    if (t > this.duration) {
      t = this.duration
    }
    if (t < 0) {
      t = 0.0
    }
    this._setT(t)
    this.events.tick.emit(void 0)
    if (wasPlaying) {
      this.play()
    }
  }

  seek(amount: number) {
    return this.seekTo(this.t + amount)
  }

  _play() {
    if (this._actualT > this.duration) {
      return
    }
    this._lastWindowTime = performance.now()
    this._actualT -= this._waitBeforePlay
    this._queue()
    this._isPlaying = true
    this.events.play.emit(void 0)
  }

  _queue() {
    var localT, offset, wait
    localT = this._actualT
    this._currentSource = this.context.createBufferSource()
    this._currentSource.buffer = this.decodedBuffer
    this._currentSource.connect(this.node)
    offset = 0
    if (localT > 0) {
      offset = localT / 1000.0
    }
    wait = 0
    if (localT < 0) {
      wait = this.context.currentTime - localT / 1000.0
    }
    return this._currentSource.start(wait, offset)
  }

  _unqueue() {
    this._currentSource!.stop(0)
  }
}
