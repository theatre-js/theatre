// @flow
import * as React from 'react'
import compose from 'ramda/src/compose'
import {connect} from '$studio/common/utils'
import {type ComponentID} from '$studio/componentModel/types'
import createReactElement from '$studio/componentModel/utils/createReactElement'

type Props = {
  children: React.Node,
  currentCanvasCommponentID: ?ComponentID,
}

const RenderCanvas = (props: Props) => {
  const currentCanvasCommponentID =
    props.currentCanvasCommponentID || 'PassThroughCanvas'

  return createReactElement(currentCanvasCommponentID, {children: props.children})
}

export default compose(
  connect((appState) => {
    return {
      currentCanvasCommponentID: appState.workspace.currentCanvasCommponentID,
    }
  }),
)(RenderCanvas)