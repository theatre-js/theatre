import derivedClass from '$src/shared/DataVerse/derivedClass/derivedClass'
import Ticker from '$src/shared/DataVerse/Ticker'

describe('derivedClass', () => {
  let ticker: Ticker
  beforeEach(() => {
    ticker = new Ticker()
  })

  describe('examples', () => {
    const example = it
    example('{a}', () => {
      const o = derivedClass({
        a() {
          return 'a'
        },
      }).instance(ticker)
      expect(o.prop('a').getValue()).toEqual('a')
    })
    example('{a} => {b}', () => {
      const o = derivedClass({
        a() {
          return 'a'
        },
      })
        .extend({
          b() {
            return 'b'
          },
        })
        .instance(ticker)
      expect(o.prop('a').getValue()).toEqual('a')
      expect(o.prop('b').getValue()).toEqual('b')
    })
    example('{a} => {a}', () => {
      const o = derivedClass({
        a() {
          return 'a'
        },
        b() {
          return 'b'
        },
      })
        .extend({
          a() {
            return 'a2'
          },
        })
        .instance(ticker)
      expect(o.prop('a').getValue()).toEqual('a2')
      expect(o.prop('b').getValue()).toEqual('b')
    })

    example("{a} => {a'}", () => {
      const o = derivedClass({
        a() {
          return 'a1'
        },
      })
        .extend({
          a(ps) {
            return ps.propFromSuper('a').map(s => s + '2')
          },
        })
        .instance(ticker)

      expect(o.prop('a').getValue()).toEqual('a12')
      expect(o.prop('a')).toEqual(o.prop('a'))
    })
    example("{a}(replaced) => {a'}", () => {
      const layer0 = derivedClass({
        a() {
          return 'layer0'
        },
      })
      const layer1 = derivedClass({
        a(ps) {
          return ps.propFromSuper('a').map(s => s + 'layer1')
        },
      })

      layer1.setPrototype(layer0)
      const o = layer1.instance(ticker)

      expect(o.prop('a').getValue()).toEqual('layer0layer1')
      const a = o.prop('a')
      expect(o.prop('a')).toEqual(a)

      const newLayer0 = derivedClass({
        a() {
          return 'newLayer0'
        },
      })

      layer1.setPrototype(newLayer0)
      expect(o.prop('a').getValue()).toEqual('layer0layer1')

      ticker.tick()
      expect(o.prop('a').getValue()).toEqual('newLayer0layer1')
      expect(o.prop('a')).toEqual(a)
    })
  })
})
