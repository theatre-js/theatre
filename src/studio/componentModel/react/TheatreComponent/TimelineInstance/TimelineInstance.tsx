import ValueInstance from '$studio/componentModel/react/TheatreComponent/TimelineInstance/ValueInstance'
import dictAtom, {DictAtom} from '$shared/DataVerse/deprecated/atoms/dictAtom'
import boxAtom, {BoxAtom} from '$shared/DataVerse/deprecated/atoms/boxAtom'
import Theatre from '$studio/bootstrap/Theatre'
import {PointerDerivation} from '$shared/DataVerse/derivations/pointer'

export default class TimelineInstance {
  _timeLength: number
  _playBeginRafTime: number
  _playBeginTime: number
  playing: boolean
  atom: DictAtom<{time: BoxAtom<number>}>
  _descriptorP: $FixMe
  timeP: PointerDerivation<BoxAtom<number>>
  _studio: Theatre
  _pathToTimelineDescriptor: Array<string>
  _af: undefined | number

  constructor(
    descriptorP: $FixMe,
    studio: Theatre,
    pathToTimelineDescriptor: Array<string>,
  ) {
    this.atom = dictAtom({
      time: boxAtom(0),
    })

    this._pathToTimelineDescriptor = pathToTimelineDescriptor
    this._studio = studio

    this.timeP = this.atom.pointer().prop('time')

    this._descriptorP = descriptorP
    this.playing = false
    this._af = undefined
    this._timeLength = 40 * 1000
  }

  destroy() {}

  valueFor(varId: string) {
    const varDescP = this._descriptorP.prop('variables').prop(varId)
    const valueInstance = new ValueInstance(
      varDescP,
      this.timeP,
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
