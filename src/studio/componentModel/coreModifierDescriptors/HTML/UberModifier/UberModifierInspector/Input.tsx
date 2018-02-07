import {StudioComponent, React, resolveCss, connect, reduceStateAction} from '$studio/handy'
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

interface IState {
  isBeingDragged: boolean
  move: {x: number, y: number}
  initialPos: {x: number, y: number}
}

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
    this.state = {
      isBeingDragged: false,
      move: {x: 0, y: 0},
      initialPos: {x: 0, y: 0},
    }
  }

  onChange = (e: React.ChangeEvent<{value: string}>) => {
    const value = e.target.value

    this.reduceState(this.props.pathToProp, o => {
      return value
    })
  }

  _handleDragStart(e) {
    this._addGlobalCursorRule()

    const {clientX: x, clientY: y} = e
    this.setState(() => ({isBeingDragged: true, initialPos: {x, y}}))

    this.props.dispatch(
      reduceStateAction(
        ['workspace', 'panels', 'panelObjectBeingDragged'],
        () => ({type: 'modifier', prop: this.props.prop})
      )
    )
  }

  _handleDragEnd() {
    this._removeGlobalCursorRule()
    this.setState(() => ({isBeingDragged: false, move: {x: 0, y: 0}, initialPos: {x: 0, y: 0}}))

    this.props.dispatch(
      reduceStateAction(
        ['workspace', 'panels', 'panelObjectBeingDragged'],
        () => null
      )
    )
  }

  _addGlobalCursorRule() {
    document.styleSheets[0].insertRule(
      `* {cursor: move !important;}`,
      document.styleSheets[0].cssRules.length,
    )
    document.styleSheets[0].insertRule(
      'div[class^="Panel_container_"] {z-index: 0 !important;}',
      document.styleSheets[0].cssRules.length,
    )
    document.styleSheets[0].insertRule(
      'div[class^="AnimationTimelinePanel_container_"] > * {pointer-events: none !important;}',
      document.styleSheets[0].cssRules.length,
    )
  }

  _removeGlobalCursorRule() {
    document.styleSheets[0].deleteRule(document.styleSheets[0].cssRules.length - 1)
    document.styleSheets[0].deleteRule(document.styleSheets[0].cssRules.length - 1)
    document.styleSheets[0].deleteRule(document.styleSheets[0].cssRules.length - 1)
  }

  render() {
    const {props, state} = this
    const classes = resolveCss(css, props.css)
    const {label, value: rawValue} = props
    const {move, initialPos} = state

    const value = typeof rawValue === 'string' ? rawValue : ''

    return (
      <Subscriber channel={PanelPropsChannel}>
        {({activeMode}) => {
          return (
            <DraggableArea
              shouldRegisterEvents={activeMode === MODE_CMD}
              onDragStart={(e) => this._handleDragStart(e)}
              onDrag={(x, y) => this.setState(() => ({move: {x, y}}))}
              onDragEnd={() => this._handleDragEnd()}
            >
              <label {...classes('container')}>
                {/* <span {...classes('label')}>{label}</span> */}
                <input
                  ref={c => this.input = c}
                  {...classes('input')}
                  value={value}
                  onChange={this.onChange}
                  onKeyDown={(e) => (e.keyCode === 13) ? this.input.blur() : null}
                  disabled={typeof rawValue === 'object'}
                />
                {state.isBeingDragged &&
                  <div
                    {...classes('draggable')}
                    style={{
                      transform: `translate3d(
                        ${initialPos.x + move.x}px,
                        ${initialPos.y + move.y}px,
                        0)`,
                    }}  
                  >
                    {props.prop}
                  </div>
                }
                {typeof rawValue === 'object' &&
                  <div {...classes('animated')}>Animated</div>
                }
              </label>
            </DraggableArea>
          )
        }}
      </Subscriber>
    )
  }
}
