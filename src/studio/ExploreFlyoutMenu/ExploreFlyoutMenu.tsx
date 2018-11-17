import React from 'react'
import * as css from './ExploreFlyoutMenu.css'
import PureComponentWithTheatre from '$studio/handy/PureComponentWithTheatre'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import {val} from '$shared/DataVerse/atom'
import AnyNode from './AnyNode'
import {createPortal} from 'react-dom'

type Props = {
  isOpen: boolean
  close: () => void
}

type State = {
  volatileIdOfRenderCurrentCanvas: undefined | string
}

class ExploreFlyoutMenu extends PureComponentWithTheatre<Props, State> {
  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.isOpen) {
      document.addEventListener('click', this.props.close)
      document.addEventListener('keydown', this.closeOnEscape)
    } else {
      document.removeEventListener('click', this.props.close)
      document.removeEventListener('keydown', this.closeOnEscape)
    }
  }

  closeOnEscape = (e: KeyboardEvent) => {
    if (e.keyCode === 27) this.props.close()
  }

  render() {
    if (!this.props.isOpen) return null
    return createPortal(
      <div className={css.container}>
        <div className={css.wrapper}>
          <PropsAsPointer>
            {() => {
              const whatToShowInBody = val(
                this.studio.atom2.pointer.historicWorkspace.viewports
                  .whatToShowInBody,
              )

              if (whatToShowInBody.type === 'Viewports') {
                const activeViewportId = val(
                  this.studio.atom2.pointer.historicWorkspace.viewports
                    .activeViewportId,
                )

                if (!activeViewportId) return null
                const volatileIdOfActiveViewport = val(
                  this.studio.studio.elementTree.atom.pointer
                    .unexpandedViewports[activeViewportId],
                )
                if (!volatileIdOfActiveViewport) return null

                return (
                  <AnyNode depth={1} volatileId={volatileIdOfActiveViewport} />
                )
              } else {
                throw new Error(`Implement me`)
              }
            }}
          </PropsAsPointer>
        </div>
      </div>,
      document.body,
    )
  }
}

export default ExploreFlyoutMenu
