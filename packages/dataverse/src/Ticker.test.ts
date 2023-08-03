// eslint-disable-next-line import/no-extraneous-dependencies
import {Ticker} from '@theatre/dataverse'
import {EMPTY_TICKS_BEFORE_GOING_DORMANT} from './Ticker'

describe(`Ticker`, () => {
  test(`Usage of Ticker`, async () => {
    const ticker = new Ticker()
    const listener = jest.fn()

    ticker.onNextTick(listener)

    ticker.tick()
    expect(listener).toHaveBeenCalledTimes(1)

    ticker.tick()
    expect(listener).toHaveBeenCalledTimes(1)
  })

  test(`Tickers go dormant`, () => {
    const onDormant = jest.fn()
    const onActive = jest.fn()
    const ticker = new Ticker({onDormant, onActive})
    expect(ticker.dormant).toBe(true)

    const listener = jest.fn()
    ticker.onNextTick(listener)
    expect(ticker.dormant).toBe(false)
    expect(onActive).toHaveBeenCalledTimes(1)

    ticker.tick()
    expect(listener).toHaveBeenCalledTimes(1)

    // at this point, the ticker is active, but after a few ticks, it should go dormant
    for (let i = 0; i < EMPTY_TICKS_BEFORE_GOING_DORMANT; i++) {
      ticker.tick()
      if (i < EMPTY_TICKS_BEFORE_GOING_DORMANT - 1) {
        expect(ticker.dormant).toBe(false)
        expect(onDormant).toHaveBeenCalledTimes(0)
      }
    }

    expect(ticker.dormant).toBe(true)
    expect(onDormant).toHaveBeenCalledTimes(1)

    // after going dormant, it should stay dormant
    ticker.tick()
    expect(ticker.dormant).toBe(true)
    expect(onDormant).toHaveBeenCalledTimes(1)

    // but if we schedule a callback, it should go active again
    ticker.onNextTick(listener)
    expect(ticker.dormant).toBe(false)
    expect(onActive).toHaveBeenCalledTimes(2)
  })

  test(`Ticker.onThisOrNextTick()`, () => {
    const ticker = new Ticker()
    const mainListener = jest.fn(() => {
      ticker.onNextTick(thisWillBeCalledOnTheNextTick)
      ticker.onThisOrNextTick(thisWillBeCalledOnTheSameTick)
    })
    const thisWillBeCalledOnTheSameTick = jest.fn()
    const thisWillBeCalledOnTheNextTick = jest.fn()

    ticker.onThisOrNextTick(mainListener)
    expect(mainListener).toHaveBeenCalledTimes(0)
    expect(thisWillBeCalledOnTheSameTick).toHaveBeenCalledTimes(0)
    expect(thisWillBeCalledOnTheNextTick).toHaveBeenCalledTimes(0)

    ticker.tick()
    expect(mainListener).toHaveBeenCalledTimes(1)
    expect(thisWillBeCalledOnTheSameTick).toHaveBeenCalledTimes(1)
    expect(thisWillBeCalledOnTheNextTick).toHaveBeenCalledTimes(0)

    ticker.tick()
    expect(mainListener).toHaveBeenCalledTimes(1)
    expect(thisWillBeCalledOnTheSameTick).toHaveBeenCalledTimes(1)
    expect(thisWillBeCalledOnTheNextTick).toHaveBeenCalledTimes(1)
  })
})
