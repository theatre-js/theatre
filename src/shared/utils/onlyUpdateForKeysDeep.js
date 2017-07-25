// @flow
import {shouldUpdate} from 'recompose'
import deepEqual from 'deep-equal'
import pick from 'lodash/pick'

type Ident = <T>(a: T) => T

const onlyUpdateForKeysDeep = (keys: Array<string>): Ident =>
  (shouldUpdate((prev: Object, next: Object) => !deepEqual(pick(prev, keys), pick(next, keys))): any)

export default onlyUpdateForKeysDeep