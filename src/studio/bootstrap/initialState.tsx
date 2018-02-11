
import {default as common} from '$studio/common/initialState'
import {default as workspace} from '$studio/workspace/initialState'
import {default as componentModel} from '$studio/componentModel/initialState'
import {IStoreState} from '../types'

const initialState: IStoreState = {
  common,
  workspace,
  componentModel,
}

export default initialState
