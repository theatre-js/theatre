// import {PathBasedReducer} from '$shared/utils/redux/withHistory/PathBasedReducer'
export default function update<S>(
  path: Array<string | number | undefined>,
  reducer: (...args: $IntentionalAny[]) => $IntentionalAny,
  state: S,
) {
  if (path.length === 0) return reducer(state)
  return hoop(state, path as $IntentionalAny, reducer)
}

const hoop = (s: any, path: Array<string | number>, reducer: any): any => {
  if (path.length === 0) {
    return reducer(s)
  }
  if (Array.isArray(s)) {
    let [index, ...restOfPath] = path
    index = parseInt(String(index), 10)
    if (isNaN(index)) index = 0
    const oldVal = s[index]
    const newVal = hoop(oldVal, restOfPath, reducer)
    if (oldVal === newVal) return s
    const newS = [...s]
    newS.splice(index, 1, newVal)
    return newS
  } else if (typeof s === 'object' && s !== null) {
    const [key, ...restOfPath] = path
    const oldVal = s[key]
    const newVal = hoop(oldVal, restOfPath, reducer)
    if (oldVal === newVal) return s
    const newS = {...s, [key]: newVal}
    return newS
  } else {
    const [key, ...restOfPath] = path

    return {[key]: hoop(undefined, restOfPath, reducer)}
  }
}

// import update from 'lodash/fp/update'

// export default update
