import {StudioComponent, React, resolveCss} from '$studio/handy'
import * as css from './PaleMessage.css'

interface IProps {
  css?: any
  message: string
}

interface IState {}

export default class PaleMessage extends StudioComponent<IProps, IState> {
  constructor(props: IProps, context: any) {
    super(props, context)
    this.state = {}
  }

  render() {
    const {props} = this
    const classes = resolveCss(css, props.css)

    return <div {...classes('container')}>{props.message}</div>
  }
}
