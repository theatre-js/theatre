import {D} from '$studio/handy'
import ValueInstance from './ValueInstance'

export default class TimelineInstance {
  atom: $FixMe
  _descriptorP: $FixMe
  _timeP: $FixMe
  _studio: $FixMe
  _pathToTimelineDescriptor: Array<string>

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
}
