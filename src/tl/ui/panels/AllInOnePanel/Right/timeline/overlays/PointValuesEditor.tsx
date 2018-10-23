import React from 'react'
import css from './PointValuesEditor.css'
import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import {TPointValuesEditorProps} from '$tl/ui/panels/AllInOnePanel/Right/timeline/overlays/types'
import Overlay from '$shared/components/Overlay/Overlay'
import OverlaySection from '$shared/components/Overlay/OverlaySection'
import FixedFullSizeContainer from '$shared/components/FixedFullSizeContainer/FixedFullSizeContainer'

const classes = resolveCss(css)

interface IProps extends TPointValuesEditorProps {
  onClose: () => void
}

interface IState {
  value: string
  time: string
}

class PointValuesEditor extends UIComponent<IProps, IState> {
  timeInput: HTMLInputElement | null
  valueInput: HTMLInputElement | null

  state = {
    value: String(this.props.initialValue),
    time: (this.props.initialTime / 1000).toFixed(2),
  }

  render() {
    const {left, top} = this.props
    return (
      <FixedFullSizeContainer>
        <Overlay onClickOutside={this.props.onClose}>
          <OverlaySection {...classes('container')} style={{left, top}}>
            <div {...classes('innerWrapper')}>
              <div {...classes('row')}>
                <input
                  ref={c => (this.timeInput = c)}
                  {...classes('input')}
                  value={this.state.time}
                  onKeyDown={this.handleTimeKeyDown}
                  onChange={this.handleTimeChange}
                />
                <span {...classes('label')}>time</span>
              </div>
              <div {...classes('row')}>
                <input
                  ref={c => (this.valueInput = c)}
                  {...classes('input')}
                  value={this.state.value}
                  onKeyDown={this.handleValueKeyDown}
                  onChange={this.handleValueChange}
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
    this.valueInput!.focus()
    this.valueInput!.select()
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

    this.project.reduxStore.dispatch(
      this.project._actions.historic.setPointCoordsInBezierCurvesOfScalarValues(
        {
          propAddress: this.props.propAddress,
          pointIndex: this.props.pointIndex,
          newCoords: {
            time: Number(this.state.time) * 1000,
            value: Number(this.state.value),
          },
        },
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
