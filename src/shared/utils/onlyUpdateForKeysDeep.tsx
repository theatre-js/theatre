import {shouldUpdate} from 'recompose'
import deepEqual from 'deep-equal'
import {pick} from '$shared/utils'

type Ident = <T>(a: T) => T

const onlyUpdateForKeysDeep = (keys: Array<string>): Ident =>
  shouldUpdate(
    (prev: Object, next: Object) =>
      !deepEqual(pick(prev, keys), pick(next, keys)),
  ) as $FixMe

export default onlyUpdateForKeysDeep
