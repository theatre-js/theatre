// @flow
import {default as common} from '$studio/common/initialState'
import {default as workspace} from '$studio/workspace/initialState'
import {default as componentModel} from '$studio/componentModel/initialState'
import {default as animationTimeline} from '$studio/animationTimeline/initialState'
import {default as composePanel} from '$studio/composePanel/initialState'
import {type StoreState} from '../types'

const initialState: StoreState = {
  common,
  workspace,
  componentModel,
  animationTimeline,
  composePanel,
}

export default initialState
