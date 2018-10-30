import React from 'react'
import ReactDOM from 'react-dom'
import css from './Overlay.css'
import Section from '$studio/common/components/Overlay/Section'

interface IProps {
  children: any
  onClickOutside: Function
}

interface IState {}

class Overlay extends React.PureComponent<IProps, IState> {
  static Section: React.ComponentClass
  refsArray: HTMLElement[] = []

  private stopPropagation = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
  }

  private clickOutsideHandler = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as Node
    let isOutside = true
    this.refsArray.forEach((ref: HTMLElement) => {
      if (ref && ref.contains(target)) {
        isOutside = false
      }
    })
    if (isOutside) {
      e.stopPropagation()
      this.props.onClickOutside()
    } else {
    }
  }

  setRef = (ref: HTMLElement) => {
    this.refsArray = this.refsArray.concat(ref)
  }

  render() {
    const children = React.Children.map(
      this.props.children,
      (child: React.ReactElement<any>) => {
        return React.cloneElement(child, {setRef: this.setRef})
      },
    )
    return ReactDOM.createPortal(
      <div
        className={css.container}
        onClick={this.clickOutsideHandler}
        onMouseDown={this.stopPropagation}
        onWheel={this.stopPropagation}
      >
        {children}
      </div>,
      document.getElementById('theaterjs-studio') as HTMLElement,
    )
  }
}

Overlay.Section = Section
export default Overlay
