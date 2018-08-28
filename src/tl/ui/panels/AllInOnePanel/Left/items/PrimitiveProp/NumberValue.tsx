import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './NumberValue.css'
import {Pointer} from '$shared/DataVerse2/pointer'
import {val} from '$shared/DataVerse2/atom'

interface IProps {
  css?: Partial<typeof css>
  value: number
  temporarilySetValue: (v: number) => void
  discardTemporaryValue: () => void
  permenantlySetValue: (v: number) => void
}

interface IState {
  mode: 'noFocus' | 'editingViaKeyboard'
  valueBeforeEditingViaKeyboard: number
  currentEditedValueInString: string
}

export default class NumberValue extends UIComponent<IProps, IState> {
  inputRef: React.RefObject<HTMLInputElement> = React.createRef()
  mode: IState['mode']
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {
      mode: 'noFocus',
      valueBeforeEditingViaKeyboard: 0,
      currentEditedValueInString: '',
    }
    this.mode = 'noFocus'
  }

  componentDidUpdate() {
    if (this.state.mode === 'editingViaKeyboard' && this.inputRef.current) {
      this.inputRef.current.focus()
    }
  }

  _render(propsP: Pointer<IProps>, stateP: Pointer<IState>) {
    const classes = resolveCss(css, this.props.css)
    const state = val(stateP)
    if (state.mode === 'noFocus') {
      return (
        <div
          {...classes('container', 'noFocus')}
          onClick={this.gotoEditingViaKeyboardMode}
        >
          <span {...classes('value')}>{val(propsP.value)}</span>
        </div>
      )
    } else if (state.mode == 'editingViaKeyboard') {
      return (
        <div {...classes('container', 'editingViaKeyboard')}>
          <input
            type="text"
            {...classes('input')}
            onChange={this.onChangeFromKeyboard}
            value={val(stateP.currentEditedValueInString)}
            onBlur={this.inputBlurred}
            ref={this.inputRef}
            onKeyDown={this.onInputKeyDown}
          />
        </div>
      )
    }
  }

  gotoEditingViaKeyboardMode = () => {
    const curValue = this.props.value
    this.setState(() => ({
      mode: 'editingViaKeyboard',
      valueBeforeEditingViaKeyboard: curValue,
      currentEditedValueInString: String(curValue),
    }))
    this.setMode('editingViaKeyboard')
  }

  inputBlurred = () => {
    if (this.mode === 'editingViaKeyboard') {
      this.commit()
      this.setMode('noFocus')
    }
  }

  isValueAcceptable(s: string) {
    const v = parseFloat(s)
    return !isNaN(v)
  }

  commit() {
    if (!this.isValueAcceptable(this.state.currentEditedValueInString)) {
      this.props.discardTemporaryValue()
    } else {
      const value = parseFloat(this.state.currentEditedValueInString)
      if (this.state.valueBeforeEditingViaKeyboard === value) {
        this.props.discardTemporaryValue()
        return
      }
      this.props.permenantlySetValue(value)
    }
  }

  onInputKeyDown = (e: React.KeyboardEvent) => {
    // debugger
    if (e.key === 'Escape') {
      this.setMode('noFocus')
      this.discardInput()
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      this.setMode('noFocus')
      // debugger
      this.commit()
    }
  }

  private setMode(mode: IState['mode']) {
    this.mode = mode
    this.setState(() => ({
      mode,
    }))
  }

  discardInput() {
    this.props.discardTemporaryValue()
    this.setState(() => ({mode: 'noFocus'}))
  }

  onChangeFromKeyboard = (e: React.ChangeEvent) => {
    const target = e.target as HTMLInputElement
    const {value} = target
    this.setState(() => ({currentEditedValueInString: value}))
    if (!this.isValueAcceptable(value)) return

    const valInFloat = parseFloat(value)
    this.props.temporarilySetValue(valInFloat)
  }
}
