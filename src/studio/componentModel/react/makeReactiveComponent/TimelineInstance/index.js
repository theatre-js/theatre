// @flow
import {D} from '$studio/handy'
import ValueInstance from './ValueInstance'

export default class TimelineInstance {
  _atom: $FixMe
  _descriptorP: *
  _timeP: *

  constructor(descriptorP: $FixMe) {
    this._atom = D.atoms.dict({
      time: D.atoms.box(0),
    })

    this._timeP = this._atom.pointer().prop('time')

    this._descriptorP = descriptorP
    // console.log('here', descriptorP.prop('vars').getValue())
  }

  destroy() {}

  valueFor(varId: string) {
    const varDescP = this._descriptorP.prop('vars').prop(varId)
    const valueInstance = new ValueInstance(varDescP, this._timeP)
    return valueInstance.derivation()
  }
}
