// @flow
import React from 'react'
import compose from 'ramda/src/compose'
import {connect} from 'react-redux'
import type {StoreState} from '$studio/types'
import {getVisiblePanelsList} from '$studio/workspace/selectors'
import Panel from '../Panel'

type Props = {
  visiblePanels: Array<string>,
}

const TheUI = (props: Props) => {
  return (
    <div>
      {
        props.visiblePanels.map((panelId) => (
          <Panel key={panelId} panelId={panelId} />
        ))
      }
    </div>
  )
}

export default compose(
  connect(
    (state: StoreState) => {
      return {
        visiblePanels: getVisiblePanelsList(state),
      }
    }
  ),
)(TheUI)
