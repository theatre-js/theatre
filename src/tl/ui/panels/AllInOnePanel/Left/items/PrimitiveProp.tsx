import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './PrimitiveProp.css'
import {Pointer} from '$shared/DataVerse2/pointer'
import {val} from '$shared/DataVerse2/atom'
import {PrimitivePropItem} from '../../utils'

const classes = resolveCss(css)
interface IProps {
  item: PrimitivePropItem
}

interface IState {}

export default class PrimitiveProp extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  _render(propsP: Pointer<IProps>, stateP: Pointer<IState>) {
    const item = val(propsP.item)
    return (
      <div
        {...classes('container')}
        style={{top: item.top + 'px', height: item.height + 'px'}}
      >
        {item.address.propKey}
      </div>
    )
  }
}
