import {ColdRx} from './ColdRx'
import {HotRx} from './HotRx'
import {waitForNext, WaitError} from './waitForNext'

describe(`mvvm tests`, () => {
  describe(`hot`, () => {
    it(`should work`, async () => {
      const hot = new HotRx(1)
      expect(await waitForNext(hot)[0]).toBe(1)

      const v = hot.forView()
      expect(await waitForNext(v)[0]).toBe(1)
    })
  })
  describe(`cold`, () => {
    it(`should not resolve when not given any values`, async () => {
      const cold = new ColdRx(() => {})
      await expect(waitForNext(cold)[0]).rejects.toBeInstanceOf(WaitError)
    })

    it(`should resolve when there are new values`, async () => {
      let next: undefined | ((value: number) => void)
      const cold = new ColdRx((sourceObserver) => {
        next = sourceObserver
        return () => {
          next = undefined
        }
      })
      const [wait1, dis1] = waitForNext(cold)
      expect(dis1.closed).toBe(false)
      next?.(1)

      await expect(wait1).resolves.toBe(1)
      expect(dis1.closed).toBe(true)
      // after waitForNext unsubscribes, there are no subscribers
      expect(next).toBeUndefined()
    })
  })
})
