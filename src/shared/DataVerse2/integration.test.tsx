import atom, {val} from './atom'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'
import Ticker from '$shared/DataVerse/Ticker'
import mapDict from './mapDict'

describe(`v2 atom`, () => {
  describe(`identity pointers`, () => {
    it(`should work`, () => {
      const data = {foo: 'hi', bar: 0}
      const a = atom(data)
      const dataP = a.pointer
      const bar = dataP.bar
      expect(val(bar)).toEqual(0)

      const d = autoDerive(() => {
        return val(bar)
      })
      expect(d.getValue()).toEqual(0)
      const ticker = new Ticker()
      const changes: number[] = []
      d.changes(ticker).tap(c => {
        changes.push(c)
      })
      a.setState({...data, bar: 1})
      ticker.tick()
      expect(changes).toHaveLength(1)
      expect(changes[0]).toEqual(1)
      a.setState({...data, bar: 1})
      ticker.tick()
      expect(changes).toHaveLength(1)
    })
  })

  describe(`dictMaps`, () => {
    it(`should work`, () => {
      const state = {one: 1, two: 2}
      const a = atom(state)
      const mapped = mapDict(a.pointer, (propP: $FixMe, key: $FixMe) => {
        return val(propP) * 2
      })
      expect(mapped._getIdentityByPath([])).toMatchObject({one: 2, two: 4})
    })
  })
})
