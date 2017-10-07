// @flow

import * as D from '$shared/DataVerse'
import {AutoDerivation} from './autoDerive'

describe('autoDerive', () => {
  let context
  beforeEach(() => {
    context = new D.Context()
  })

  it('should work', () => {
    const o = D.atoms.dict({
      foo: D.atoms.box('foo'),
    })
    const fooPointer = o.pointer().prop('foo')
    const d = new AutoDerivation(() => {
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

  });

  (function(){
    const a = new AutoDerivation(() => {
      return 'hi'
    })

    a.getValue();

    (a.getValue(): string);
    // $FlowExpectError
    (a.getValue(): number)

    const changes: Array<string> = []
    const wrongChanges: Array<number> = []

    a.changes().tap((c) => {
      changes.push(c)
      // $FlowExpectError
      wrongChanges.push(c)
    })

  });
})