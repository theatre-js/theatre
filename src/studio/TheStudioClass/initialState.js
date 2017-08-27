// @flow
import {type StoreState} from '$studio/types'
import {default as common} from '$studio/common/initialState'
import {default as workspace} from '$studio/workspace/initialState'

const initialState: StoreState = {
  common,
  workspace,
}

export default initialState