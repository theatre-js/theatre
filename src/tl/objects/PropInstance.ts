import TimelineInstanceObject from '$tl/objects/TimelineInstanceObject'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import {valueDerivation} from '$shared/DataVerse/atom'
import {
  StaticValueContainer,
  IBezierCurvesOfScalarValues,
} from '$tl/Project/store/types'
import {Pointer} from '$shared/DataVerse/pointer'
import DerivationOfBezierCurvesOfScalarValues from '$tl/objects/bezierStuff/DerivationOfBezierCurvesOfScalarValues'

export default class PropInstance {
  _valueDerivation: AbstractDerivation<number>
  constructor(
    readonly _timelnieInstanceObject: TimelineInstanceObject,
    readonly name: string,
  ) {
    const valueContainerP = this._timelnieInstanceObject._objectTemplate
      ._pointerToState.props[this.name].valueContainer

    const typeD = valueDerivation(valueContainerP.type)
    this._valueDerivation = typeD.flatMap(valueContainerType => {
      if (!valueContainerType) {
        // @todo return default value
        return 0
      } else if (valueContainerType === 'StaticValueContainer') {
        return valueDerivation(
          (valueContainerP as Pointer<StaticValueContainer>).value,
        ).map(value => {
          if (typeof value === 'number') {
            return value
          } else {
            return 0
          }
        })
      } else if (valueContainerType === 'BezierCurvesOfScalarValues') {
        return new DerivationOfBezierCurvesOfScalarValues(
          (valueContainerP as $IntentionalAny as Pointer<
            IBezierCurvesOfScalarValues
          >).points,
          valueDerivation(
            this._timelnieInstanceObject._timelineInstance.statePointer.time,
          ),
        )
      } else {
        console.error('@todo', valueContainerType)
        return 0
      }
    })
  }

  public get value() {
    return this._valueDerivation.getValue()
  }
}
