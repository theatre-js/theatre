import {StudioComponent, React, resolveCss, connect} from '$studio/handy'
import * as css from './Input.css'
import {get} from 'lodash'
import DraggableArea from '$studio/common/components/DraggableArea'
import {
  PanelPropsChannel,
} from '$src/studio/workspace/components/Panel/Panel'
import {Subscriber} from 'react-broadcast'
import {MODE_CMD} from '$studio/workspace/components/TheUI'

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
      <Subscriber channel={PanelPropsChannel}>
        {({activeMode}) => {
          return (
            <DraggableArea
              shouldRegisterEvents={activeMode === MODE_CMD}
              onDragStart={() => console.log('start')}
              onDrag={(dx, dy) => console.log(dx, dy)}
              onDragEnd={() => console.log('end')}
            >
              <label {...classes('container')}>
                {/* <span {...classes('label')}>{label}</span> */}
                <input
                  ref={c => this.input = c}
                  {...classes('input')} 
                  value={value}
                  onChange={this.onChange}
                  onKeyDown={(e) => (e.keyCode === 13) ? this.input.blur() : null}
                />
              </label>
            </DraggableArea>
          )
        }}
      </Subscriber>
    )
  }
}
