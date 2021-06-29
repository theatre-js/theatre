import actionCreator from '@theatre/studio/utils/redux/actionCreator'

describe('@theatre/studio/utils/redux/actionCreator()', () => {
  const actionType = 'Bootstrap'
  const payload = {a: 1, b: 2}
  let creator = actionCreator(actionType)

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

  /* eslint-disable unused-imports/no-unused-vars-ts */
  function typeTests() {
    const creator = actionCreator(actionType)
    // @ts-ignore
    let a: any = creator.type as 'Bootstrap'
    // $FlowExpectError
    a = creator.type as 's'
    const action = creator(payload)
    a = action.payload.a as 1
    // $FlowExpectError
    a = action.payload.a as 2
    a = action.payload as {a: number; b: number}
  }
  /* eslint-enable unused-imports/no-unused-vars-ts */
})
