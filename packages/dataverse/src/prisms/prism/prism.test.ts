/*
 * @jest-environment jsdom
 */
import Atom, {val} from '../../Atom'
import Ticker from '../../Ticker'
import type {$FixMe, $IntentionalAny} from '../../types'
import iterateAndCountTicks from '../iterateAndCountTicks'
import prism from './prism'

describe('prism', () => {
  let ticker: Ticker
  beforeEach(() => {
    ticker = new Ticker()
  })

  it('should work', () => {
    const o = new Atom({foo: 'foo'})
    const d = prism(() => {
      return val(o.pointer.foo) + 'boo'
    })
    expect(d.getValue()).toEqual('fooboo')

    const changes: Array<$FixMe> = []
    d.onChange(ticker, (c) => {
      changes.push(c)
    })

    o.reduceState(['foo'], () => 'foo2')
    ticker.tick()
    expect(changes).toMatchObject(['foo2boo'])
  })
  it('should only collect immediate dependencies', () => {
    const aD = prism(() => 1)
    const bD = prism(() => aD.getValue() * 2)
    const cD = prism(() => {
      return bD.getValue()
    })
    expect(cD.getValue()).toEqual(2)
    const untap = cD.keepHot()
    expect((cD as $IntentionalAny)._state.handle._dependencies.size).toEqual(1)
    untap()
  })

  describe('prism.ref()', () => {
    it('should work', () => {
      const theAtom: Atom<{n: number}> = new Atom({n: 2})

      const isEvenD = prism((): {isEven: boolean} => {
        const ref = prism.ref<{isEven: boolean} | undefined>('cache', undefined)
        const currentN = val(theAtom.pointer.n)

        const isEven = currentN % 2 === 0
        if (ref.current && ref.current.isEven === isEven) {
          return ref.current
        } else {
          ref.current = {isEven}
          return ref.current
        }
      })

      const iterator = iterateAndCountTicks(isEvenD)

      theAtom.reduceState(['n'], () => 3)

      expect(iterator.next().value).toMatchObject({
        value: {isEven: false},
        ticks: 0,
      })
      theAtom.reduceState(['n'], () => 5)
      theAtom.reduceState(['n'], () => 7)
      expect(iterator.next().value).toMatchObject({
        value: {isEven: false},
        ticks: 1,
      })
      theAtom.reduceState(['n'], () => 2)
      theAtom.reduceState(['n'], () => 4)
      expect(iterator.next().value).toMatchObject({
        value: {isEven: true},
        ticks: 1,
      })
      expect(iterator.next().value).toMatchObject({
        value: {isEven: true},
        ticks: 0,
      })
    })
  })

  describe('prism.effect()', () => {
    it('should work', async () => {
      let iteration = 0
      const sequence: unknown[] = []
      let deps: unknown[] = []

      const a = new Atom({letter: 'a'})

      const prsm = prism(() => {
        const n = val(a.pointer.letter)
        const iterationAtTimeOfCall = iteration
        sequence.push({derivationCall: iterationAtTimeOfCall})

        prism.effect(
          'f',
          () => {
            sequence.push({effectCall: iterationAtTimeOfCall})
            return () => {
              sequence.push({cleanupCall: iterationAtTimeOfCall})
            }
          },
          [...deps],
        )

        return n
      })

      const untap = prsm.onChange(ticker, (change) => {
        sequence.push({change})
      })

      expect(sequence).toMatchObject([{derivationCall: 0}, {effectCall: 0}])
      sequence.length = 0

      iteration++
      a.setIn(['letter'], 'b')
      ticker.tick()
      expect(sequence).toMatchObject([{derivationCall: 1}, {change: 'b'}])
      sequence.length = 0

      deps = [1]
      iteration++
      a.setIn(['letter'], 'c')
      ticker.tick()
      expect(sequence).toMatchObject([
        {derivationCall: 2},
        {cleanupCall: 0},
        {effectCall: 2},
        {change: 'c'},
      ])
      sequence.length = 0

      untap()

      // takes a tick before untap takes effect
      await new Promise((resolve) => setTimeout(resolve, 1))
      expect(sequence).toMatchObject([{cleanupCall: 2}])
    })
  })

  describe('prism.memo()', () => {
    it('should work', async () => {
      let iteration = 0
      const sequence: unknown[] = []
      let deps: unknown[] = []

      const a = new Atom({letter: 'a'})

      const prsm = prism(() => {
        const n = val(a.pointer.letter)
        const iterationAtTimeOfCall = iteration
        sequence.push({derivationCall: iterationAtTimeOfCall})

        const resultOfMemo = prism.memo(
          'memo',
          () => {
            sequence.push({memoCall: iterationAtTimeOfCall})
            return iterationAtTimeOfCall
          },
          [...deps],
        )

        sequence.push({resultOfMemo})

        return n
      })

      const untap = prsm.onChange(ticker, (change) => {
        sequence.push({change})
      })

      expect(sequence).toMatchObject([
        {derivationCall: 0},
        {memoCall: 0},
        {resultOfMemo: 0},
      ])
      sequence.length = 0

      iteration++
      a.setIn(['letter'], 'b')
      ticker.tick()
      expect(sequence).toMatchObject([
        {derivationCall: 1},
        {resultOfMemo: 0},
        {change: 'b'},
      ])
      sequence.length = 0

      deps = [1]
      iteration++
      a.setIn(['letter'], 'c')
      ticker.tick()
      expect(sequence).toMatchObject([
        {derivationCall: 2},
        {memoCall: 2},
        {resultOfMemo: 2},
        {change: 'c'},
      ])
      sequence.length = 0

      untap()
    })
  })

  describe(`prism.scope()`, () => {
    it('should prevent name conflicts', () => {
      const d = prism(() => {
        const thisNameWillBeUsedForBothMemos = 'blah'
        const a = prism.scope('a', () => {
          return prism.memo(thisNameWillBeUsedForBothMemos, () => 'a', [])
        })

        const b = prism.scope('b', () => {
          return prism.memo(thisNameWillBeUsedForBothMemos, () => 'b', [])
        })

        return {a, b}
      })
      expect(d.getValue()).toMatchObject({a: 'a', b: 'b'})
    })
  })
})
