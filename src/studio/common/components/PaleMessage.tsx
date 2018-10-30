import * as css from './PaleMessage.css'
import resolveCss from '$shared/utils/resolveCss'
import PureComponentWithTheatre from '$studio/handy/PureComponentWithTheatre'
import React from 'react'

interface IProps {
  css?: any
  message: string
  style?: 'paler' | 'normal'
}

interface IState {}

export default class PaleMessage extends PureComponentWithTheatre<
  IProps,
  IState
> {
  constructor(props: IProps, context: any) {
    super(props, context)
    this.state = {}
  }

  render() {
    const {props} = this
    const classes = resolveCss(css, props.css)

    return <div {...classes('container', props.style)}>{props.message}</div>
  }
}
