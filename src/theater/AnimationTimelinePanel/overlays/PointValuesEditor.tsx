import React from 'react'
import css from './PointValuesEditor.css'
import {resolveCss} from '$shared/utils'
import {TPointValuesEditorProps} from '$theater/AnimationTimelinePanel/overlays/types'
import Overlay from '$theater/common/components/Overlay/Overlay'
import {reduceHistoricState} from '$theater/bootstrap/actions'
import {TPoint} from '$theater/AnimationTimelinePanel/types'
import PureComponentWithTheater from '$theater/handy/PureComponentWithTheater'

const classes = resolveCss(css)

interface IProps extends TPointValuesEditorProps {
  pathToTimeline: string[]
  onClose: () => void
}

interface IState {
  value: string
  time: string
}

class PointValuesEditor extends PureComponentWithTheater<IProps, IState> {
  timeInput: HTMLInputElement | null
  valueInput: HTMLInputElement | null

  state = {
    value: String(this.props.initialValue),
    time: (this.props.initialTime / 1000).toFixed(2),
  }

  componentDidMount() {
    this.valueInput!.focus()
    this.valueInput!.select()
  }

  render() {
    const {left, top} = this.props
    return (
      <Overlay onClickOutside={this.props.onClose}>
        <Overlay.Section>
          <div {...classes('container')} style={{left, top}}>
            <div {...classes('row')}>
              <span {...classes('icon')}>{String.fromCharCode(0x25ba)}</span>
              <input
                ref={c => (this.timeInput = c)}
                {...classes('input')}
                value={this.state.time}
                onKeyDown={this.handleTimeKeyDown}
                onChange={this.handleTimeChange}
              />
            </div>
            <div {...classes('row')}>
              <span {...classes('icon')}>{String.fromCharCode(0x25b2)}</span>
              <input
                ref={c => (this.valueInput = c)}
                {...classes('input')}
                value={this.state.value}
                onKeyDown={this.handleValueKeyDown}
                onChange={this.handleValueChange}
              />
            </div>
          </div>
        </Overlay.Section>
      </Overlay>
    )
  }

  _handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    input: 'time' | 'value',
  ) => {
    if (e.keyCode === 9) {
      e.preventDefault()
      // this._submit()
      if (input === 'time') {
        this.timeInput!.blur()
        this.valueInput!.focus()
        this.valueInput!.select()
      }
      if (input === 'value') {
        this.valueInput!.blur()
        this.timeInput!.focus()
        this.timeInput!.select()
      }
    }
    if (e.keyCode === 13) {
      this._submit()
      this.props.onClose()
    }
    if (e.keyCode === 27) {
      this.props.onClose()
    }
  }

  _submit() {
    if (
      this.state.value === String(this.props.initialValue) &&
      this.state.time === (this.props.initialTime / 1000).toFixed(2)
    ) {
      return
    }
    this.dispatch(
      reduceHistoricState(
        [
          ...this.props.pathToTimeline,
          'variables',
          this.props.variableId,
          'points',
          this.props.pointIndex,
        ],
        (point: TPoint): TPoint => ({
          ...point,
          time: Number(this.state.time) * 1000,
          value: Number(this.state.value),
        }),
      ),
    )
  }

  _handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    input: 'time' | 'value',
  ) => {
    const {value} = e.target
    if (input === 'time') this.setState(() => ({time: value}))
    if (input === 'value') this.setState(() => ({value: value}))
  }

  handleTimeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    this._handleKeyDown(e, 'time')
  }

  handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this._handleChange(e, 'time')
  }

  handleValueKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    this._handleKeyDown(e, 'value')
  }

  handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this._handleChange(e, 'value')
  }
}

export default PointValuesEditor
