import {StudioComponent, React, resolveCss} from '$studio/handy'
import * as css from './Input.css'

interface IProps {css?: any, label: string}

interface IState {}

export default class Input extends StudioComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  render() {
    const {props} = this
    const classes = resolveCss(css, props.css)
    const {label} = props
    
    return <div {...classes('container')}>
      <label {...classes('label')}>{label}</label>
    </div>
  }
}