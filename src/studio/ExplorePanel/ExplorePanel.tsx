import Panel from '$src/studio/workspace/components/Panel/Panel'
import {PanelOutput} from '$studio/workspace/types'
import React from 'react'
import css from './ExplorePanel.css'
import StudioComponent from '$studio/handy/StudioComponent'
import PropsAsPointer from '$studio/handy/PropsAsPointer'
import {val} from '$shared/DataVerse2/atom'
import AnyNode from './AnyNode'

type Props = {
  outputs: PanelOutput
  updatePanelOutput: Function
}

type State = {
  volatileIdOfRenderCurrentCanvas: undefined | string
}

class ExplorerPanel extends StudioComponent<Props, State> {
  static panelName = 'Explore'
  render() {
    return (
      <Panel>
        <div className={css.container}>
          <PropsAsPointer props={this.props}>
            {() => {
              const whatToShowInBody = val(
                this.studio.atom2.pointer.historicWorkspace.viewports.whatToShowInBody,
              )

              if (whatToShowInBody.type === 'Viewports') {
                const activeViewportId = val(
                  this.studio.atom2.pointer.historicWorkspace.viewports
                    .activeViewportId,
                )

                if (!activeViewportId) return null
                const volatileIdOfActiveViewport = val(
                  this.studio.elementTree.atom.pointer.unexpandedViewports[
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
      </Panel>
    )
  }
}

export default ExplorerPanel
