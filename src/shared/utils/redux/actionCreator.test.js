// @flow

import actionCreator from '$shared/utils/redux/actionCreator'

describe('$shared/utils/redux/actionCreator()', () => {
  const actionType = 'Bootstrap'
  const payload = {a: 1, b: 2}
  let creator

  beforeEach(() => {
    creator = actionCreator(actionType)
  })

  describe('output action', () => {
    it('should maintain the same type and payload', () => {
      const output = creator(payload)

      expect(output.type).toEqual(actionType)
      expect(output.payload).toEqual(payload)
    })
  })

  describe('the action creator', () => {
    it('should have a reference to the original action type', () => {
      expect(creator.type).toEqual(actionType)
    })
  })

  function typeTests() { // eslint-disable-line
    const creator = actionCreator(actionType)
    let a: any = (creator.type: 'Bootstrap') // eslint-disable-line
    // $FlowExpectError
    a = (creator.type: 's')
    const action = creator(payload)
    a = (action.payload.a: 1)
    // $FlowExpectError
    a = (action.payload.a: 2)
    a = (action.payload: {a: number, b: number})
  }
})