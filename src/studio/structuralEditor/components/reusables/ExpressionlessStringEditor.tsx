import StudioComponent from '$studio/handy/StudioComponent'
import React from 'react'
import {reduceStateAction} from '$shared/utils/redux/commonActions'
import * as css from './ExpressionlessStringEditor.css'
import resolveCss from '$shared/utils/resolveCss'
import {val} from '$shared/DataVerse2/atom'
import PropsAsPointer from '$studio/handy/PropsAsPointer'
import {get} from 'lodash'

interface IOwnProps {
  path: Array<string>
  css?: Partial<typeof css>
}

interface IProps extends IOwnProps {}

interface State {}

export default class ExpressionlessStringEditor extends StudioComponent<
  IProps,
  State
> {
  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target
    this.dispatch(reduceStateAction(this.props.path, () => value))
  }

  render() {
    const {props} = this
    const classes = resolveCss(css, props.css)

    return (
      <PropsAsPointer props={props}>
        {(propsP, studio) => {
          const value = val(get(studio.atom2.pointer, val(propsP.path)))

          return (
            <div {...classes('container')}>
              <input
                {...classes('input')}
                type="text"
                value={typeof value === 'string' ? value : ''}
                onChange={this.onChange}
              />
            </div>
          )
        }}
      </PropsAsPointer>
    )
  }
}
