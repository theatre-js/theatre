// @flow
import pointer from './pointer'
import * as D from '$shared/DataVerse'
import {DictAtom} from '$shared/DataVerse/atoms/dict'

describe('pointer', () => {
  let context
  beforeEach(() => {
    context = new D.Context()
  })
  it('should work', () => {
    const root =D.atoms.dict({
      a:D.atoms.dict({
        aa: D.atoms.box('aa'),
        bb: D.atoms.box('bb'),
      }),
    })
    const aaP = root.prop('a').prop('aa').pointer()
    expect(aaP.getValue()).toEqual('aa')
    root.prop('a').prop('aa').set('aa2')
    expect(aaP.getValue()).toEqual('aa2')
    root.prop('a').deleteProp('aa')
    expect(aaP.getValue()).toEqual(undefined)
    root.prop('a').setProp('aa',D.atoms.dict({}))
    expect(aaP.getValue()).toBeInstanceOf(DictAtom)
    root.prop('a').setProp('aa',D.atoms.dict({aa: D.atoms.box('aa3')}))
    expect(aaP.getValue()).toBeInstanceOf(DictAtom)
    root.prop('a').setProp('aa', D.atoms.box('aa3'))
    expect(aaP.getValue()).toEqual('aa3')
  })

  it('should work', () => {
    const root =D.atoms.dict({
      a:D.atoms.dict({
        aa: D.atoms.box('aa'),
        bb: D.atoms.box('bb'),
      }),
    })
    const aaP = root.prop('a').prop('aa').pointer()
    aaP.setDataVerseContext(context)
    const changes = []
    aaP.changes().tap((c) => {changes.push(c)})
    expect(aaP.getValue()).toEqual('aa')
    root.prop('a').prop('aa').set('aa2')
    context.tick()
    expect(aaP.getValue()).toEqual('aa2')
    root.prop('a').deleteProp('aa')
    context.tick()
    expect(aaP.getValue()).toEqual(undefined)
    root.prop('a').setProp('aa',D.atoms.dict({}))
    context.tick()
    expect(aaP.getValue()).toBeInstanceOf(DictAtom)
    root.prop('a').setProp('aa',D.atoms.dict({aa: D.atoms.box('aa3')}))
    context.tick()
    expect(aaP.getValue()).toBeInstanceOf(DictAtom)
    root.prop('a').setProp('aa', D.atoms.box('aa3'))
    context.tick()
    expect(aaP.getValue()).toEqual('aa3')
  })

  it('should work with derived stuff too', () => {
    const context = new D.Context()
    const foo = D.atoms.box('foo')
    const atom =D.atoms.dict({
      a:D.atoms.dict({
        foo,
      }),
    })

    const o = D.derivations.prototypalDict({
      a() {
        return atom
      },
      b() {
        return 'hi'
      },
    })
    const f = o.face(context)
    expect(f.pointer().prop('b').getValue()).toEqual('hi')
    expect(f.pointer().prop('a').prop('a').prop('foo').getValue()).toEqual('foo')

    const changes = []
    f.pointer().prop('a').prop('a').prop('foo').setDataVerseContext(context).changes().tap((c) => {
      changes.push(c)
    })

    foo.set('foo2')
    context.tick()
    expect(changes).toMatchObject(['foo2'])

  })
})