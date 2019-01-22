import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'

interface IProps<T> {
  css: {[className: string]: string}
  validator: (v: string) => string | void
  stringify: (v: T) => string
  parseString: (v: string) => T
  value: T
  cycleFocus: () => void
  onRequestCommit: () => void
  onRequestDiscard: () => void
  onChange: (v: T) => void
}

interface IState<T> {
  unedited: T
  isEdited: boolean
  editedInString: string
  lastValidString: string
}

export default class Input<T = number> extends UIComponent<
  IProps<T>,
  IState<T>
> {
  ref = React.createRef<HTMLInputElement>()
  _syncState: IState<T>
  constructor(props: IProps<T>, context: $IntentionalAny) {
    super(props, context)
    this.state = {
      unedited: props.value,
      isEdited: false,
      editedInString: '',
      lastValidString: props.stringify(props.value),
    }
    this._syncState = this.state
  }

  render() {
    const classes = resolveCss(this.props.css)

    return (
      <input
        ref={this.ref}
        {...classes(
          'input',
          !this._isStringValid(this._getInputValue()) && 'invalid',
        )}
        value={this._getInputValue()}
        onKeyDown={this._handleKeyDown}
        onChange={this._handleChange}
      />
    )
  }

  _getInputValue() {
    return this._syncState.isEdited
      ? this._syncState.editedInString
      : this.props.stringify(this.props.value)
  }

  focus() {
    this.ref.current!.focus()
  }

  select() {
    this.ref.current!.select()
  }

  _handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    
    // Tab
    if (e.keyCode === 9) {
      e.preventDefault()
      this.ref.current!.blur()
      this.props.cycleFocus()
    }
    // Enter
    if (e.keyCode === 13) {
      this.props.onRequestCommit()
    }
    // Esc
    if (e.keyCode === 27) {
      this.props.onRequestDiscard()
    }
  }

  _handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value: valueInString} = e.target
    const oldState = this._syncState

    const newState: IState<T> = !oldState.isEdited
      ? {
          unedited: this.props.value,
          isEdited: true,
          editedInString: valueInString,
          lastValidString: this._isStringValid(valueInString)
            ? valueInString
            : this.props.stringify(this.props.value),
        }
      : {
          ...oldState,
          editedInString: valueInString,
          lastValidString: this._isStringValid(valueInString)
            ? valueInString
            : oldState.lastValidString,
        }

    this._setSyncState(newState)
    this.props.onChange(this.getValue(newState))
  }

  _isStringValid(s: string): boolean {
    return typeof this.props.validator(s) !== 'string'
  }

  _setSyncState(s: IState<T>) {
    this.setState(s)
    this._syncState = s
  }

  getState() {
    return this._syncState
  }

  getValue(s: IState<T> = this._syncState): T {
    return !s.isEdited ? s.unedited : this.props.parseString(s.lastValidString)
  }

  isEdited() {
    return this._syncState.isEdited
  }
}
