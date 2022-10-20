/*
 * @jest-environment jsdom
 */
import Atom, {val, valueDerivation} from '../../Atom'
import Box from '../../Box'
import Ticker from '../../Ticker'
import type {$FixMe, $IntentionalAny} from '../../types'
import ConstantDerivation from '../ConstantDerivation'
import iterateAndCountTicks from '../iterateAndCountTicks'
import derive, {DerivationFunctionDerivation} from './derivationFunction'

describe('prism', () => {
  let ticker: Ticker
  beforeEach(() => {
    ticker = new Ticker()
  })

  it('should work', () => {
    const o = new Atom({foo: 'foo'})
    const d = new DerivationFunctionDerivation(function* () {
      return (yield o.pointer.foo) + 'boo'
    })
    expect(d.getValue()).toEqual('fooboo')

    const changes: Array<$FixMe> = []
    d.changes(ticker).tap((c) => {
      changes.push(c)
    })

    o.reduceState(['foo'], () => 'foo2')
    ticker.tick()
    expect(changes).toMatchObject(['foo2boo'])
  })
  it('should only collect immediate dependencies', () => {
    const aD = new ConstantDerivation(1)
    const bD = aD.map((v) => v * 2)
    const cD = derive(function* () {
      return yield bD
    })
    expect(cD.getValue()).toEqual(2)
    expect((cD as $IntentionalAny)._dependencies.size).toEqual(1)
  })

  describe('derive.ref()', () => {
    it('should work', () => {
      const theAtom: Atom<{n: number}> = new Atom({n: 2})

      const box = new Box<{isEven: boolean} | undefined>(undefined)
      const isEvenD = derive(function* () {
        const currentN = val(theAtom.pointer.n)

        const isEven = currentN % 2 === 0
        if (box.get()?.isEven === isEven) {
          return box.get()
        } else {
          box.set({isEven})
          return box.get()
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

  describe('derive.effect()', () => {
    it('should work', async () => {
      let iteration = 0
      const sequence: unknown[] = []
      const deps = new Atom([])

      const a = new Atom({letter: 'a'})

      const derivation = derive(function* () {
        const n = yield a.pointer.letter
        const iterationAtTimeOfCall = iteration
        sequence.push({derivationCall: iterationAtTimeOfCall})

        const b = valueDerivation(deps.pointer).map((depVals) => {
          sequence.push({effectCall: iterationAtTimeOfCall})
          return () => {
            sequence.push({cleanupCall: iterationAtTimeOfCall})
          }
        })

        return n
      })

      const untap = derivation.changes(ticker).tap((change) => {
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

  describe('derive.memo()', () => {
    it('should work', async () => {
      let iteration = 0
      const sequence: unknown[] = []
      let deps: unknown[] = []

      const a = new Atom({letter: 'a'})

      const derivation = derive(() => {
        const n = val(a.pointer.letter)
        const iterationAtTimeOfCall = iteration
        sequence.push({derivationCall: iterationAtTimeOfCall})

        const resultOfMemo = derive.memo(
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

      const untap = derivation.changes(ticker).tap((change) => {
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

  describe(`derive.scope()`, () => {
    it('should prevent name conflicts', () => {
      const d = derive(() => {
        const thisNameWillBeUsedForBothMemos = 'blah'
        const a = derive.scope('a', () => {
          return derive.memo(thisNameWillBeUsedForBothMemos, () => 'a', [])
        })

        const b = derive.scope('b', () => {
          return derive.memo(thisNameWillBeUsedForBothMemos, () => 'b', [])
        })

        return {a, b}
      })
      expect(d.getValue()).toMatchObject({a: 'a', b: 'b'})
    })
  })
})
