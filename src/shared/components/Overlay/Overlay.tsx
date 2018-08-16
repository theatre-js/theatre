import React from 'react'
import Section from '$shared/components/Overlay/Section'

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
  static Section: React.ComponentClass = Section
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
    document.addEventListener('mousedown', this.disableEvent, true)
    document.addEventListener('wheel', this.disableEvent, true)
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick, true)
    document.removeEventListener('mousedown', this.disableEvent, true)
    document.removeEventListener('wheel', this.disableEvent, true)
    this.refsCollection.clear()
  }

  setRef: TOverlayAPI['setRef'] = ref => {
    if (ref != null) this.refsCollection = this.refsCollection.add(ref)
  }

  api: TOverlayAPI = {
    setRef: this.setRef,
  }

  private handleClick = (evt: MouseEvent) => {
    const {target} = evt
    if (target == null) return

    let isOutside = true
    Array.from(this.refsCollection).forEach(ref => {
      if (ref && ref.contains(target as Node)) {
        isOutside = false
      }
    })
    if (isOutside) {
      this.disableEvent(evt)
      this.props.onClickOutside()
    }
  }

  private disableEvent = (evt: MouseEvent) => {
    evt.stopPropagation()
    evt.preventDefault()
  }
}

export default Overlay
