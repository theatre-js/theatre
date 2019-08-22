import React from 'react'
import css from './PointValuesEditor.css'
import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import {IPointValuesEditorProps} from '$tl/ui/panels/AllInOnePanel/Right/timeline/overlays/types'
import Overlay from '$shared/components/Overlay/Overlay'
import OverlaySection from '$shared/components/Overlay/OverlaySection'
import FixedFullSizeContainer from '$shared/components/FixedFullSizeContainer/FixedFullSizeContainer'
import {ITempActionGroup} from '$shared/utils/redux/withHistory/actions'
import {GenericAction} from '$shared/types'
import Input from './PointValuesEditor/Input'

const classes = resolveCss(css)

interface IProps extends IPointValuesEditorProps {
  onClose: () => void
}

interface IState {
  temporaryActionDispatched: boolean
}

const valueValidator = (s: string): string | void => {
  if (!s.match(/^[\-]?[0-9]+(\.[0-9]+)?$/)) return 'This is not a number'
  const v = parseFloat(s)

  if (isNaN(v)) {
    return 'This is not a number'
  }
}

const timeValidator = (s: string): string | void => {
  if (!s.match(/^[\-]?[0-9]+(\.[0-9]+)?$/)) return 'This is not a number'
  const v = parseFloat(s)
  if (isNaN(v)) {
    return 'This is not a number'
  } else if (v < 0) {
    return `Keyframes cannot be placed before 0`
  }
}

const numberToString = (n: number) =>
  typeof n === 'number' ? String(+n.toFixed(6)) : ''

const stringToNumber = (n: string) => {
  return parseFloat(n)
}

class PointValuesEditor extends UIComponent<IProps, IState> {
  tempActionGroup: ITempActionGroup
  timeRef = React.createRef<Input>()
  valueRef = React.createRef<Input>()
  didCleanup = false

  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.tempActionGroup = this.project._actions.historic.temp()

    this.state = {
      temporaryActionDispatched: false,
    }
  }
  // @ts-ignore
  componentWillReceiveProps(newProps: IProps) {}

  render() {
    const {left, top} = this.props
    return (
      <FixedFullSizeContainer>
        <Overlay onClickOutside={this.props.onClose}>
          <OverlaySection {...classes('container')} style={{left, top}}>
            <div {...classes('innerWrapper')}>
              <div {...classes('row')}>
                <Input
                  ref={this.timeRef}
                  css={{input: css.input, invalid: css.inputInvalid}}
                  validator={timeValidator}
                  stringify={numberToString}
                  parseString={stringToNumber}
                  value={this.props.initialTime / 1000}
                  cycleFocus={() => this._cycleFocus('time')}
                  onRequestCommit={this._onRequestCommit}
                  onRequestDiscard={this._onRequestDiscard}
                  onChange={this._onAnyInputChange}
                />
                <span {...classes('label')}>time</span>
              </div>
              <div {...classes('row')}>
                <Input
                  ref={this.valueRef}
                  css={{input: css.input, invalid: css.inputInvalid}}
                  validator={valueValidator}
                  stringify={numberToString}
                  parseString={stringToNumber}
                  value={this.props.initialValue}
                  cycleFocus={() => this._cycleFocus('value')}
                  onRequestCommit={this._onRequestCommit}
                  onRequestDiscard={this._onRequestDiscard}
                  onChange={this._onAnyInputChange}
                />
                <span {...classes('label')}>value</span>
              </div>
            </div>
          </OverlaySection>
        </Overlay>
      </FixedFullSizeContainer>
    )
  }

  componentDidMount() {
    this.valueRef.current!.focus()
    this.valueRef.current!.select()
  }

  _cycleFocus = (currentFocus: 'time' | 'value') => {
    const el =
      currentFocus === 'value' ? this.timeRef.current : this.valueRef.current
    el!.focus()
  }

  _onAnyInputChange = () => {
    this.temporarilySetValues(
      this.valueRef.current!.getValue(),
      this.timeRef.current!.getValue(),
    )
  }

  _onRequestCommit = () => {
    this.didCleanup = true
    if (this.valueRef.current!.isEdited() || this.timeRef.current!.isEdited()) {
      this.permenantlySetValues(
        this.valueRef.current!.getValue(),
        this.timeRef.current!.getValue(),
      )
    } else {
      this.discardTemporaryValues()
    }
    this.props.onClose()
  }

  _onRequestDiscard = () => {
    this.didCleanup = true
    this.discardTemporaryValues()
    this.props.onClose()
  }

  componentWillUnmount() {
    if (!this.didCleanup) {
      this._onRequestCommit()
    }
  }

  temporarilySetValues = (value: number, time: number) => {
    this.project._dispatch(
      this.tempActionGroup.push(this._changeValuesAction(value, time)),
    )
  }

  discardTemporaryValues = () => {
    this.project.reduxStore.dispatch(this.tempActionGroup.discard())
  }

  permenantlySetValues = (value: number, time: number) => {
    this.project._dispatch(
      this.tempActionGroup.discard(),
      this._changeValuesAction(value, time),
    )
  }

  private _changeValuesAction(value: number, time: number): GenericAction {
    return this.project._actions.historic.setPointCoordsInBezierCurvesOfScalarValues(
      {
        propAddress: this.props.propAddress,
        pointIndex: this.props.pointIndex,
        newCoords: {
          time: time * 1000,
          value: value,
        },
      },
    )
  }
}

export default PointValuesEditor
