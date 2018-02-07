import {D} from '$studio/handy'
import ValueInstance from './ValueInstance'

export default class TimelineInstance {
  _timeLength: number;
  _playBeginRafTime: number;
  _playBeginTime: number;
  playing: boolean
  atom: $FixMe
  _descriptorP: $FixMe
  _timeP: $FixMe
  _studio: $FixMe
  _pathToTimelineDescriptor: Array<string>
  _af: undefined | number

  constructor(
    descriptorP: $FixMe,
    studio: $FixMe,
    pathToTimelineDescriptor: Array<string>,
  ) {
    this.atom = D.atoms.dict({
      time: D.atoms.box(0),
    })

    // setInterval(() => {
    //   const time = this._atom.prop('time')
    //   time.set(time.getValue() > 2 ? 0 : time.getValue() + 0.1)
    //   // console.log('time', time.getValue())
    // }, 100)

    this._pathToTimelineDescriptor = pathToTimelineDescriptor
    this._studio = studio

    this._timeP = this.atom.pointer().prop('time')

    this._descriptorP = descriptorP
    this.playing = false
    this._af = undefined
    this._timeLength = 40 * 1000

    // setTimeout(this.play.bind(this), 1000)
    // console.log('here', descriptorP.prop('variables').getValue())
  }

  destroy() {}

  valueFor(varId: string) {
    const varDescP = this._descriptorP.prop('variables').prop(varId)
    const valueInstance = new ValueInstance(
      varDescP,
      this._timeP,
      this._studio,
      [...this._pathToTimelineDescriptor, 'variables', varId],
    )
    return valueInstance.derivation()
  }

  play() {
    if (this.playing) return
    this.playing = true

    this._playBeginRafTime = performance.now()
    this._playBeginTime = this.atom.prop('time').getValue()
    this._af = requestAnimationFrame(this._tick)
  }

  _tick = () => {
    this._af = requestAnimationFrame(this._tick)

    const now = performance.now()
    
    const deltaRafTime = now - this._playBeginRafTime
    let newTime = this._playBeginTime + deltaRafTime
    if (newTime >= this._timeLength) {
      this.pause()
      newTime = this._timeLength
    }

    this.atom.prop('time').set(newTime)
  }

  pause() {
    if (!this.playing) return

    cancelAnimationFrame(this._af as $IntentionalAny)
    this._af = undefined
    this.playing = false
  }

  togglePlay() {
    if (this.playing) {
      this.pause()
    } else {
      this.play()
    }
  }
}
