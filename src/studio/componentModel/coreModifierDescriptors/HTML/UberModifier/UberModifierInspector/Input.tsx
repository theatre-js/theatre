import {StudioComponent, React, resolveCss, connect} from '$studio/handy'
import * as css from './Input.css'
import {get} from 'lodash'

interface OP {
  prop: string
  pathToModifierInstantiationDescriptor: string[]
}

interface IProps extends OP {
  css?: any
  label: string
  value: undefined | number
  pathToProp: string[]
}

interface IState {}

@connect((s, op: OP) => {
  const pathToProp = [
    ...op.pathToModifierInstantiationDescriptor,
    'props',
    op.prop,
  ]
  return {
    pathToProp,
    value: get(s, pathToProp),
  }
})
export default class Input extends StudioComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  onChange = (e: React.ChangeEvent<{value: string}>) => {
    const value = e.target.value

    this.reduceState(this.props.pathToProp, o => {
      return value
    })
  }

  render() {
    const {props} = this
    const classes = resolveCss(css, props.css)
    const {label, value: rawValue} = props

    const value = typeof rawValue === 'string' ? rawValue : ''

    return (
      <label {...classes('container')}>
        <span {...classes('label')}>{label}</span>
        <input {...classes('input')} value={value} onChange={this.onChange} />
      </label>
    )
  }
}
