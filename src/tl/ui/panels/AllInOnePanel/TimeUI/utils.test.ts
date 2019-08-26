import {roundTimeToClosestFrame} from './utils'
import {FRAME_DURATION} from '$tl/ui/panels/AllInOnePanel/TimeUI/utils'
describe(`TimeUI/utils`, () => {
  describe(`roundTimeToClosestFrame()`, () => {
    it('examples', () => {
      expect(roundTimeToClosestFrame(100, FRAME_DURATION)).toEqual(
        FRAME_DURATION * 3,
      )
      expect(roundTimeToClosestFrame(101, FRAME_DURATION)).toEqual(
        FRAME_DURATION * 3,
      )
      expect(roundTimeToClosestFrame(120, FRAME_DURATION)).toEqual(
        FRAME_DURATION * 4,
      )
      expect(
        roundTimeToClosestFrame(FRAME_DURATION * 4, FRAME_DURATION),
      ).toEqual(FRAME_DURATION * 4)
    })
  })
})
