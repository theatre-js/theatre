import {default as common} from '$studio/common/initialState'
import {default as workspace} from '$studio/workspace/initialState'
import {default as componentModel} from '$studio/componentModel/initialState'
import {IStoreState} from '../types'

const initialInnerState = {
  common,
  workspace,
  componentModel,
}

const initialState: IStoreState = {
  ...initialInnerState,
  '@@history': {
    currentCommitHash: undefined,
    commitsByHash: {},
    listOfCommitHashes: [],
    innerState: initialInnerState
  },
  '@@tempActions': []
}

export default initialState
