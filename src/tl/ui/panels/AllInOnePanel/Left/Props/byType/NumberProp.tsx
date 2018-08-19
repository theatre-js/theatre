import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './NumberProp.css'
import {Pointer} from '$shared/DataVerse2/pointer'
import {val} from '$shared/DataVerse2/atom'
import {PropsOfProp} from './common/types'

const classes = resolveCss(css)

interface IProps extends PropsOfProp {}

interface IState {
  settingInput: boolean
}

export default class NumberProp extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {settingInput: false}
  }

  _render(propsP: Pointer<IProps>, stateP: Pointer<IState>) {
    console.log(this.props)

    return (
      <div {...classes('container')}>
        <div {...classes('label')}>{this.props.propKey}</div>
        <div {...classes('valueContainer')}>
          {val(stateP.settingInput) === true
            ? this._renderInput(propsP, stateP)
            : this._renderValue(propsP, stateP)}
        </div>
      </div>
    )
  }

  _renderInput(propsP: Pointer<IProps>, stateP: Pointer<IState>) {
    return null
  }

  _renderValue(propsP: Pointer<IProps>, stateP: Pointer<IState>) {
    const valueContainerP = this.props.internalObject._pointerToState.props[
      val(propsP.propKey)
    ].valueContainer

    const storedValueType = val(valueContainerP.type)

    if (!storedValueType) {
      return <span {...classes('value')}>0</span>
    } else if (storedValueType === 'StaticValueContainer') {
      const value = val(valueContainerP.value)
      return <span {...classes('value')}>{value.stringRepresentation}</span>
    } else {
      console.error('Only supporting PrimitiveValue atm')
      return 'Error'
    }
  }
}
