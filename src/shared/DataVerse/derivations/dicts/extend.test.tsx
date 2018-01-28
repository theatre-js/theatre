// @flow
import * as D from '$shared/DataVerse'

describe('extend()', () => {
  let ticker
  beforeEach(() => {
    ticker = new D.Ticker()
  })
  it('should work', () => {
    const o1 = D.atoms.dict({
      a: D.atoms.box('a'),
    })

    const o2: D.IDictAtom<{
      b: D.IBoxAtom<string>
      a: D.IBoxAtom<undefined | null | string>
      c?: D.IBoxAtom<string>
    }> = D.atoms.dict({
      b: D.atoms.box('b'),
      a: D.atoms.box(undefined),
    })

    const x = o1.derivedDict().extend(o2.derivedDict())

    expect(x.prop('a').getValue()).toEqual('a')
    expect(x.prop('b').getValue()).toEqual('b')

    const aP = x.prop('a')

    o1.prop('a').set('aa')
    expect(aP.getValue()).toEqual('aa')
    o2.setProp('a', D.atoms.box('a2'))
    expect(aP.getValue()).toEqual('a2')

    const aPChanges: Array<string> = []
    aP.changes(ticker).tap(c => {
      aPChanges.push(c)
    })

    o2.prop('a').set('aa2')
    ticker.tick()
    expect(aPChanges).toMatchObject(['aa2'])
    o1.prop('a').set('aaa')
    ticker.tick()
    expect(aPChanges).toHaveLength(1)

    expect(x.keys()).toHaveLength(2)
    expect(x.keys()).toContain('a')
    expect(x.keys()).toContain('b')

    const cChanges = []
    // debugger
    x.changes().tap(c => {
      cChanges.push(c)
    })

    o2.setProp('c', D.atoms.box('c'))
    expect(x.keys()).toHaveLength(3)
    expect(x.keys()).toContain('a')
    expect(x.keys()).toContain('b')
    expect(x.keys()).toContain('c')

    expect(cChanges[0]).toMatchObject({addedKeys: ['c'], deletedKeys: []})
    o2.deleteProp('c')
    expect(cChanges[1]).toMatchObject({addedKeys: [], deletedKeys: ['c']})
    o2.deleteProp('a')
    expect(cChanges).toHaveLength(2)
    o1.deleteProp('a')
    expect(cChanges[2]).toMatchObject({addedKeys: [], deletedKeys: ['a']})
    // $FlowIgnore
    o1.setProp('b', D.atoms.box('bb'))
    expect(cChanges).toHaveLength(3)
  })
})
