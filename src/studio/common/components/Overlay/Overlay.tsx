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

  componentDidMount() {
    document.addEventListener('click', this.clickOutsideHandler)
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.clickOutsideHandler)
  }

  private clickOutsideHandler = (e: MouseEvent) => {
    const target = e.target as Node
    let isOutside = true
    this.refsArray.forEach((ref: HTMLElement) => {
      if (ref && ref.contains(target)) {
        isOutside = false
      }
    })
    if (isOutside) this.props.onClickOutside()
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
      <div className={css.container}>{children}</div>,
      document.getElementById('theaterjs-studio') as HTMLElement,
    )
  }
}

Overlay.Section = Section
export default Overlay
