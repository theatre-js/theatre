import PureComponentWithTheater from '$studio/handy/PureComponentWithTheater'
import React from 'react'
import {reduceStateAction} from '$shared/utils/redux/commonActions'
import * as css from './ExpressionlessStringEditor.css'
import resolveCss from '$shared/utils/resolveCss'
import {val} from '$shared/DataVerse2/atom'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import {get} from '$shared/utils'
import {TheaterConsumer} from '$studio/componentModel/react/utils/theaterContext'

interface IOwnProps {
  path: Array<string>
  css?: Partial<typeof css>
}

interface IProps extends IOwnProps {}

interface State {}

export default class ExpressionlessStringEditor extends PureComponentWithTheater<
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
      <TheaterConsumer>
        {theater => (
          <PropsAsPointer props={props}>
            {({props: propsP}) => {
              const value = val(get(theater.atom2.pointer, val(propsP.path)))

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
        )}
      </TheaterConsumer>
    )
  }
}
