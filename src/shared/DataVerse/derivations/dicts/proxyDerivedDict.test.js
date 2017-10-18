// @flow
import proxyDerivedDict from './proxyDerivedDict'
import * as D from '$shared/DataVerse'

describe('DerivedDictStabilizer', () => {
  let context
  beforeEach(() => {context = new D.Context()})

  it('should work', () => {
    const o = D.atoms.dict({foo: '1'})
    const oD = o.derivedDict()

    const proxy = proxyDerivedDict(oD)
    const d = proxy.prop('foo')

    expect(d.getValue()).toEqual('1')

    const dChanges: Array<string> = []
    d.setDataVerseContext(context).changes().tap((c) => {dChanges.push(c)})

    context.tick()
    expect(dChanges).toHaveLength(0)

    o.setProp('foo', '1-1')
    expect(dChanges).toHaveLength(0)
    context.tick()
    expect(dChanges).toMatchObject(['1-1'])

    const o2 = D.atoms.dict({foo: '2'})
    const o2D = o2.derivedDict()

    proxy.setSource(o2D)
    expect(dChanges).toHaveLength(1)
    context.tick()
    expect(dChanges).toMatchObject(['1-1', '2'])

  })
})