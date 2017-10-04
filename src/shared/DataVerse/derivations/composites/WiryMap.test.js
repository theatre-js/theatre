// @flow
import WiryMap from './WiryMap'
import * as D from '$shared/DataVerse'

describe('WiryMap', () => {
  let context
  beforeEach(() => {context = new D.Context()})

  describe('examples', () => {
    const example = it
    example('{a}', () => {
      const o = new WiryMap({
        a() {return 'a'},
      }).face(context)
      expect(o.prop('a').getValue()).toEqual('a')
    })
    example('{a} => {b}', () => {
      const o = new WiryMap({
        a() {return 'a'},
      }).extend({b() {return 'b'}}).face(context)
      expect(o.prop('a').getValue()).toEqual('a')
      expect(o.prop('b').getValue()).toEqual('b')
    })
    example('{a} => {a}', () => {
      const o = new WiryMap({
        a() {return 'a'},
        b() {return 'b'},
      }).extend({a() {return 'a2'}}).face(context)
      expect(o.prop('a').getValue()).toEqual('a2')
      expect(o.prop('b').getValue()).toEqual('b')
    })

    example('{a} => {a\'}', () => {
      const o = new WiryMap({
        a() {return 'a1'},
      }).extend({a(ps) {return ps.propFromAbove('a').map((s) => s + '2')}}).face(context)

      expect(o.prop('a').getValue()).toEqual('a12')
      expect(o.prop('a')).toEqual(o.prop('a'))
    })
    example('{a}(replaced) => {a\'}', () => {
      const layer0 = new WiryMap({
        a() {return 'layer0'},
      })
      const layer1 = new WiryMap({
        a(ps) {
          return ps.propFromAbove('a').map((s) => s + 'layer1')
        },
      })

      layer1.setParent(layer0)
      const o = layer1.face(context)

      expect(o.prop('a').getValue()).toEqual('layer0layer1')
      const a = o.prop('a')
      expect(o.prop('a')).toEqual(a)

      const newLayer0 = new WiryMap({
        a() {return 'newLayer0'},
      })

      layer1.setParent(newLayer0)
      expect(o.prop('a').getValue()).toEqual('layer0layer1')

      context.tick()
      expect(o.prop('a').getValue()).toEqual('newLayer0layer1')
      // @todo
      // expect(o.prop('a')).toEqual(a)


    })
  })
})