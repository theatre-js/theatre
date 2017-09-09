// @flow
import {default as common} from '$studio/common/initialState'
import {default as workspace} from '$studio/workspace/initialState'
import {default as componentmodel} from '$studio/componentmodel/initialState'
import {type CoreState} from '../types'

const initialState: CoreState = {
  common,
  workspace,
  componentmodel,
}

export default initialState