import TimelineInstanceObject from '$tl/objects/TimelineInstanceObject'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'
import {val} from '$shared/DataVerse2/atom'
import {StaticValueContainer} from '$tl/Project/store/types'
import { Pointer } from '$shared/DataVerse2/pointer';

export default class PropInstance {
  _valueDerivation: AbstractDerivation<$FixMe>
  constructor(
    readonly _timelnieInstanceObject: TimelineInstanceObject,
    readonly name: string,
  ) {
    const valueContainerP = this._timelnieInstanceObject._internalObject
      ._pointerToState.props[this.name].valueContainer
    const valueContainerTypeP = valueContainerP.type
    // @ts-ignore
    this._valueDerivation = autoDerive(() => {
      const valueContainerType = val(valueContainerTypeP)
      if (!valueContainerType) {
        // @todo return default value
        return 0
      } else if (valueContainerType === 'StaticValueContainer') {
        const value = val((valueContainerP as Pointer<StaticValueContainer>).value)
        
      } else {
        console.error('Value')
      }
    })
  }

  public get value() {
    return this._valueDerivation.getValue()
  }
}
