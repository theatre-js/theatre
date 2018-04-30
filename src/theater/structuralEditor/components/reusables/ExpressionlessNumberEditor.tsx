import StudioComponent from '$theater/handy/StudioComponent'
import React from 'react'
import {reduceStateAction} from '$shared/utils/redux/commonActions'
import * as css from './ExpressionlessStringEditor.css'
import resolveCss from '$shared/utils/resolveCss'
import {val} from '$shared/DataVerse2/atom'
import PropsAsPointer from '$theater/handy/PropsAsPointer'
import {get} from 'lodash'

interface IOwnProps {
  path: Array<string>
  css?: Partial<typeof css>
}

interface IProps extends IOwnProps {}

interface State {}

export default class ExpressionlessNumberEditor extends StudioComponent<
  IProps,
  State
> {
  ref: HTMLInputElement | null = null
  currentValue: number = 0
  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value: stringValue} = e.target
    const parsedInFloat = parseFloat(stringValue)
    const value = parsedInFloat === parsedInFloat ? parsedInFloat : 0
    this.setValue(value)
  }

  setRef = (ref: HTMLInputElement | null) => {
    if (this.ref && this.ref !== ref) {
      this.stopListeningToRef(this.ref)
    }

    this.ref = ref

    if (ref) {
      this.startListeningToRef(ref)
    }
  }

  componentWillUnmount() {
    if (this.ref) this.stopListeningToRef(this.ref)
  }

  private setValue(value: number) {
    this.dispatch(reduceStateAction(this.props.path, () => value))
  }

  startListeningToRef(ref: HTMLInputElement) {
    ref.addEventListener('keydown', this.handleKeyDown)
  }

  stopListeningToRef(ref: HTMLPictureElement) {
    ref.removeEventListener('keydown', this.handleKeyDown)
  }

  handleKeyDown = (e: KeyboardEvent) => {
    if (e.keyCode === 38) {
      this.setValue(this.currentValue + 1)
    } else if (e.keyCode === 40) {
      this.setValue(this.currentValue - 1)
    }
  }

  render() {
    const {props} = this
    const classes = resolveCss(css, props.css)

    return (
      <PropsAsPointer props={props}>
        {(propsP, theater) => {
          const value = val(get(theater.atom2.pointer, val(propsP.path))) as
            | number
            | undefined
          this.currentValue = value || 0

          return (
            <div {...classes('container')}>
              <input
                {...classes('input')}
                type="text"
                ref={this.setRef}
                value={typeof value === 'number' ? String(value) : ''}
                onChange={this.onChange}
              />
            </div>
          )
        }}
      </PropsAsPointer>
    )
  }
}
