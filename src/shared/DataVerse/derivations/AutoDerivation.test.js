// @flow

import * as D from '$shared/DataVerse'

describe('AutoDerivation', () => {
  let context
  beforeEach(() => {
    context = new D.Context()
  })

  it('should work', () => {
    const o = new D.MapAtom({
      foo: new D.BoxAtom('foo'),
    })
    const fooPointer = o.pointer().prop('foo')
    const d = new D.AutoDerivation(() => {
      return fooPointer.getValue() + 'boo'
    })
    expect(d.getValue()).toEqual('fooboo')

    const changes = []
    d.setDataVerseContext(context).changes().tap((c) => {
      changes.push(c)
    })

    o.prop('foo').set('foo2')
    context.tick()
    expect(changes).toMatchObject(['foo2boo'])

  })
})