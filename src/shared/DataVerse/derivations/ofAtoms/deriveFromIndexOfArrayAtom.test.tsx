import deriveFromIndexOfArrayAtom from './deriveFromIndexOfArrayAtom'
import arrayAtom from '$shared//DataVerse/atoms/arrayAtom'
import Ticker from '$shared//DataVerse/Ticker'
import boxAtom, {BoxAtom} from '$shared//DataVerse/atoms/boxAtom'

describe('deriveFromIndexOfArrayAtom', () => {
  it('should work', () => {
    const ticker = new Ticker()

    const originals: Array<BoxAtom<string>> = [
      boxAtom('0'),
      boxAtom('1'),
      boxAtom('2'),
      boxAtom('3'),
      boxAtom('4'),
    ]
    const a = arrayAtom(originals)
    const index3 = deriveFromIndexOfArrayAtom(a, 3).map(val => val.getValue())
    const changes: string[] = []
    index3.changes(ticker).tap(c => {
      changes.push(c)
    })

    a.setIndex(0, boxAtom('01s'))
    a.setIndex(4, boxAtom('41'))
    ticker.tick()
    expect(changes).toHaveLength(0)

    a.setIndex(3, boxAtom('31'))
    ticker.tick()
    expect(changes).toMatchObject(['31'])
    // debugger
    a.splice(2, 1, [])
    ticker.tick()
    expect(changes).toHaveLength(2)
    a.splice(2, 0, [boxAtom('blah')])
    ticker.tick()
    expect(changes).toHaveLength(3)
  })
})
