// @flow
import {type CommonNamespaceState} from './types'
import {handleActions} from 'redux-actions'
import {combineReducers} from 'redux'
import {bootstrapAction} from './actions'
import {type Reducer} from 'redux'

export default (combineReducers({
  temp: combineReducers({
    bootstrapped: handleActions({
      [bootstrapAction.type]: () => true,
    }, false),
  }),
}): Reducer<CommonNamespaceState, any>)