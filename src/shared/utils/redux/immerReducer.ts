import immer from 'immer'

const immerReducer = <State, I>(
  fn: (s: State, i: I) => void,
): ((s: State, i: I) => State) => {
  return (s: State, action: I) => {
    return immer(s, draftState => {
      fn(draftState, action)
    })
  }
}

export default immerReducer
