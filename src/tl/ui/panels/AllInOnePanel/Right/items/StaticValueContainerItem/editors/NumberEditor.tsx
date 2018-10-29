import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './NumberEditor.css'
import {Pointer} from '$shared/DataVerse2/pointer'
import {val} from '$shared/DataVerse2/atom'
import DraggableArea from '$shared/components/DraggableArea/DraggableArea'

interface IProps {
  css?: Partial<typeof css>
  value: number
  temporarilySetValue: (v: number) => void
  discardTemporaryValue: () => void
  permenantlySetValue: (v: number) => void
}

interface IState {
  mode: 'noFocus' | 'editingViaKeyboard' | 'dragging'
  valueBeforeEditingViaKeyboard: number
  currentEditedValueInString: string
  valueBeforeDragging: number
  currentDraggingValue: number
}

export default class NumberEditor extends UIComponent<IProps, IState> {
  mode: IState['mode']
  inputRef: React.RefObject<HTMLInputElement>
  bodyCursorBeforeDrag: string | null

  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {
      mode: 'noFocus',
      valueBeforeEditingViaKeyboard: 0,
      currentEditedValueInString: '',
      valueBeforeDragging: 0,
      currentDraggingValue: 0,
    }
    this.mode = 'noFocus'
    this.inputRef = React.createRef()
  }

  _render(propsP: Pointer<IProps>, stateP: Pointer<IState>) {
    const classes = resolveCss(css, this.props.css)
    const state = val(stateP)

    const theInput = (
      <input
        key="input"
        type="text"
        {...classes('input')}
        onChange={this.inputChange}
        value={
          state.mode !== 'editingViaKeyboard'
            ? String(val(propsP.value))
            : val(stateP.currentEditedValueInString)
        }
        onBlur={this.onBlur}
        onKeyDown={this.onInputKeyDown}
        onClick={this.onClick}
        onFocus={this.onFocus}
        ref={this.inputRef}
        onMouseDown={this.onMouseDown}
        onDoubleClick={this.onDoubleClick}
      />
    )
    return (
      <div {...classes('container', state.mode)}>
        <DraggableArea
          key="draggableArea"
          onDragStart={this.onDragStart}
          onDragEnd={this.onDragEnd}
          onDrag={this.onDrag}
          enabled={state.mode !== 'editingViaKeyboard'}
        >
          {theInput}
        </DraggableArea>
      </div>
    )
  }

  onBlur = () => {
    if (this.mode === 'editingViaKeyboard') {
      this.commitKeyboardInput()
      this.setMode('noFocus')
    } else {
      // this should not happen
      // debugger
    }
  }

  isValueAcceptable(s: string) {
    const v = parseFloat(s)
    return !isNaN(v)
  }

  commitKeyboardInput() {
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
      this.discardInput()
      this.getInput().blur()
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      // this.setMode('noFocus')
      // debugger
      this.commitKeyboardInput()
      this.getInput().blur()
    }
  }

  private setMode(mode: IState['mode']) {
    // if (mode === 'noFocus') console.trace()

    this.mode = mode
    this.setState(() => ({
      mode,
    }))
  }

  discardInput() {
    this.props.discardTemporaryValue()
    // this.setState(() => ({mode: 'noFocus'}))
  }

  inputChange = (e: React.ChangeEvent) => {
    const target = e.target as HTMLInputElement
    const {value} = target
    this.setState(() => ({currentEditedValueInString: value}))
    if (!this.isValueAcceptable(value)) return

    const valInFloat = parseFloat(value)
    this.props.temporarilySetValue(valInFloat)
  }

  onClick = (e: React.MouseEvent) => {
    if (this.mode === 'noFocus') {
      const c = this.getInput()
      c.focus()
      e.preventDefault()
      e.stopPropagation()
    } else {
      e.stopPropagation()
    }
    // if (this.state.mode === 'noFocus') {
    //   this.transitionToEditingViaKeyboardMode()
    // }
  }

  onFocus = () => {
    if (this.mode === 'noFocus') {
      this.transitionToEditingViaKeyboardMode()
    } else if (this.mode === 'editingViaKeyboard') {
      // this shouldn't happen
      // debugger
    }
  }

  transitionToEditingViaKeyboardMode = () => {
    const curValue = this.props.value
    this.setState(() => ({
      valueBeforeEditingViaKeyboard: curValue,
      currentEditedValueInString: String(curValue),
    }))
    this.setMode('editingViaKeyboard')
    setTimeout(() => {
      this.getInput().focus()
      this.getInput().setSelectionRange(0, 100)
    })
  }

  onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  onDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  onDragStart = () => {
    this.transitionToDraggingMode()
  }

  transitionToDraggingMode = () => {
    const curValue = this.props.value
    this.setState(() => ({
      valueBeforeDragging: curValue,
      currentDraggingValue: curValue,
    }))
    this.setMode('dragging')
    this.bodyCursorBeforeDrag = document.body.style.cursor
  }

  onDragEnd = (happened: boolean) => {
    // console.log('end', this.getInput());

    if (!happened) {
      this.discardDrag()
      this.setMode('noFocus')

      this.getInput().focus()
      this.getInput().setSelectionRange(0, 100)
    } else {
      this.commitDrag()
      this.setMode('noFocus')
    }
  }

  discardDrag() {
    this.props.discardTemporaryValue()
  }

  commitDrag() {
    const value = this.state.currentDraggingValue
    if (this.state.valueBeforeDragging === value) {
      this.props.discardTemporaryValue()
      return
    }
    this.props.permenantlySetValue(value)
  }

  onDrag = (dx: number, dy: number) => {
    const newValue = this.state.valueBeforeDragging - dy
    this.setState({
      currentDraggingValue: newValue,
    })
    this.props.temporarilySetValue(newValue)
  }

  private getInput() {
    return this.inputRef.current as HTMLInputElement
  }
}
