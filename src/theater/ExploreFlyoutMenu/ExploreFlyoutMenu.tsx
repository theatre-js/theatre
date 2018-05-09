import React from 'react'
import * as css from './ExploreFlyoutMenu.css'
import StudioComponent from '$theater/handy/StudioComponent'
import PropsAsPointer from '$theater/handy/PropsAsPointer'
import {val} from '$shared/DataVerse2/atom'
import AnyNode from './AnyNode'
import {createPortal} from 'react-dom'

type Props = {
  isOpen: boolean
}

type State = {
  volatileIdOfRenderCurrentCanvas: undefined | string
}

class ExploreFlyoutMenu extends StudioComponent<Props, State> {
  render() {
    if (!this.props.isOpen) return null
    return createPortal(
      <div className={css.container}>
        <div className={css.wrapper}>
          <PropsAsPointer props={this.props}>
            {() => {
              const whatToShowInBody = val(
                this.theater.atom2.pointer.historicWorkspace.viewports
                  .whatToShowInBody,
              )

              if (whatToShowInBody.type === 'Viewports') {
                const activeViewportId = val(
                  this.theater.atom2.pointer.historicWorkspace.viewports
                    .activeViewportId,
                )

                if (!activeViewportId) return null
                const volatileIdOfActiveViewport = val(
                  this.theater.studio.elementTree.atom.pointer.unexpandedViewports[
                    activeViewportId
                  ],
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
