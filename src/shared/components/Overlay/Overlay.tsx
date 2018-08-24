import React from 'react'

interface IProps {
  children: React.ReactNode
  onClickOutside: () => void
}

interface IState {}

type TOverlayAPI = {
  setRef: (ref: HTMLElement | null) => void
}

export const OverlayAPIContext = React.createContext({
  setRef: () => {},
} as TOverlayAPI)

class Overlay extends React.PureComponent<IProps, IState> {
  refsCollection: Set<HTMLElement> = new Set()

  render() {
    return (
      <OverlayAPIContext.Provider value={this.api}>
        {this.props.children}
      </OverlayAPIContext.Provider>
    )
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClick, true)
    document.addEventListener('mousedown', this.stopPropagation, true)
    document.addEventListener('wheel', this.disableEvent, true)
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick, true)
    document.removeEventListener('mousedown', this.stopPropagation, true)
    document.removeEventListener('wheel', this.disableEvent, true)
    this.refsCollection.clear()
  }

  setRef: TOverlayAPI['setRef'] = ref => {
    if (ref != null) this.refsCollection = this.refsCollection.add(ref)
  }

  api: TOverlayAPI = {
    setRef: this.setRef,
  }

  private handleClick = (event: MouseEvent) => {
    const {target} = event
    if (target == null) return

    if (this.isEventTargetOutside(target)) {
      this.disableEvent(event)
      this.props.onClickOutside()
    }
  }

  private stopPropagation = (event: MouseEvent) => {
    event.stopPropagation()
  }

  private disableEvent = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
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
