// @flow
import {default as common} from '$studio/common/initialState'
import {default as workspace} from '$studio/workspace/initialState'
import {default as componentModel} from '$studio/componentModel/initialState'
import {type CoreState} from '../types'
import * as D from '$shared/DataVerse'

const initialState: CoreState = D.literals.object({
  common,
  workspace,
  componentModel,
})

export default initialState