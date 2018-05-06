import React from 'react'

export type ActiveMode = undefined | null | string

interface IProps {
  children: (activeMode: ActiveMode) => any
}

interface IState {
  activeMode: ActiveMode
}

export const MODE_OPTION = 'option'
export const MODE_CMD = 'command'
export const MODE_SHIFT = 'shift'
export const MODE_D = 'd'
export const MODE_C = 'c'
export const MODE_H = 'h'

class ActiveModeDetector extends React.PureComponent<IProps, IState> {
  _isMouseDown: boolean
  state = {
    activeMode: null,
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown)
    document.addEventListener('keyup', this.handleKeyUp)
    document.addEventListener('mousedown', this.handleMouseDown)
    document.addEventListener('mouseup', this.handleMouseUp)
    document.addEventListener('mouseenter', this.resetActiveMode)
    window.addEventListener('focus', this.resetActiveMode)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown)
    document.removeEventListener('keyup', this.handleKeyUp)
    document.removeEventListener('mousedown', this.handleMouseDown)
    document.removeEventListener('mouseup', this.handleMouseUp)
    document.removeEventListener('mouseenter', this.resetActiveMode)
    window.removeEventListener('focus', this.resetActiveMode)
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (this._isMouseDown) return
    if (e.target && (e.target as HTMLElement).tagName === 'INPUT' && ![91].includes(e.keyCode)) return
    switch (e.keyCode) {
      case 16:
        this.setState(() => ({activeMode: MODE_SHIFT}))
        break
      case 18:
        this.setState(() => ({activeMode: MODE_OPTION}))
        break
      case 91:
        this.setState(() => ({activeMode: MODE_CMD}))
        break
      case 68:
        this.setState(() => ({activeMode: MODE_D}))
        break
      case 67:
        this.setState(() => ({activeMode: MODE_C}))
        break
      case 72:
        this.setState(() => ({activeMode: MODE_H}))
        break
      default:
        break
    }
  }

  private handleKeyUp = () => {
    if (this.state.activeMode != null) {
      this.resetActiveMode()
    }
  }

  private handleMouseDown = () => {
    this._isMouseDown = true
  }

  private handleMouseUp = () => {
    this._isMouseDown = false
  }

  private resetActiveMode = () => {
    this.setState(() => ({activeMode: null}))
  }

  render() {
    return this.props.children(this.state.activeMode)
  }
}

export default ActiveModeDetector
