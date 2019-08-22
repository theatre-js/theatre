import React from 'react'

interface IProps {
  children: React.ReactNode
  onClickOutside: () => void
  propagateMouseDown?: boolean
  propagateWheel?: boolean
}

interface IState {}

type IOverlayAPI = {
  setRef: (ref: HTMLElement | null) => void
}

export const OverlayAPIContext = React.createContext({
  setRef: () => {},
} as IOverlayAPI)

class Overlay extends React.PureComponent<IProps, IState> {
  refsCollection: Set<HTMLElement> = new Set()

  static defaultProps = {
    propagateMouseDown: false,
    propagateWheel: false,
  }

  render() {
    return (
      <OverlayAPIContext.Provider value={this.api}>
        {this.props.children}
      </OverlayAPIContext.Provider>
    )
  }

  componentDidMount() {
    // document.addEventListener('click', this.handleClick, true)
    document.addEventListener('mousedown', this.handleMouseDown, true)
    document.addEventListener('wheel', this.handleWheel, true)
  }

  componentWillUnmount() {
    // document.removeEventListener('click', this.handleClick, true)
    document.removeEventListener('mousedown', this.handleMouseDown, true)
    document.removeEventListener('wheel', this.handleWheel, true)
    this.refsCollection.clear()
  }

  setRef: IOverlayAPI['setRef'] = ref => {
    if (ref != null) this.refsCollection = this.refsCollection.add(ref)
  }

  api: IOverlayAPI = {
    setRef: this.setRef,
  }

  // private handleClick = (event: MouseEvent) => {
  //   const {target} = event
  //   if (target == null) return

  //   if (this.isEventTargetOutside(target)) {
  //     this.props.onClickOutside()
  //   }
  // }

  private handleMouseDown = (event: MouseEvent) => {
    const {target} = event
    if (target == null) return

    if (this.isEventTargetOutside(target)) {
      this.props.onClickOutside()
    } else {
      if (!this.props.propagateMouseDown) event.stopPropagation()
    }
  }

  private handleWheel = (event: MouseEvent) => {
    if (!this.props.propagateWheel) {
      event.stopPropagation()
      event.preventDefault()
    }
  }

  private isEventTargetOutside = (target: EventTarget) => {
    let isOutside = true
    Array.from(this.refsCollection).forEach(ref => {
      if (ref && ref.contains(target as Node)) {
        isOutside = false
      }
    })
    return isOutside
  }
}

export default Overlay
