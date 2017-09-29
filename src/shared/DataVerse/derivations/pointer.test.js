// @flow
import pointer from './pointer'
import * as D from '$shared/DataVerse'

describe('pointer', () => {
  let context
  beforeEach(() => {
    context = new D.Context()
  })
  it('should work', () => {
    const root = new D.MapAtom({
      a: new D.MapAtom({
        aa: new D.BoxAtom('aa'),
        bb: new D.BoxAtom('bb'),
      }),
    })
    const aaP = root.prop('a').prop('aa').pointer()
    expect(aaP.getValue()).toEqual('aa')
    root.prop('a').prop('aa').set('aa2')
    expect(aaP.getValue()).toEqual('aa2')
    root.prop('a').deleteProp('aa')
    expect(aaP.getValue()).toEqual(undefined)
    root.prop('a').setProp('aa', new D.MapAtom({}))
    expect(aaP.getValue()).toBeInstanceOf(D.MapAtom)
    root.prop('a').setProp('aa', new D.MapAtom({aa: new D.BoxAtom('aa3')}))
    expect(aaP.getValue()).toBeInstanceOf(D.MapAtom)
    root.prop('a').setProp('aa', new D.BoxAtom('aa3'))
    expect(aaP.getValue()).toEqual('aa3')
  })

  it('should work', () => {
    const root = new D.MapAtom({
      a: new D.MapAtom({
        aa: new D.BoxAtom('aa'),
        bb: new D.BoxAtom('bb'),
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
    root.prop('a').setProp('aa', new D.MapAtom({}))
    context.tick()
    expect(aaP.getValue()).toBeInstanceOf(D.MapAtom)
    root.prop('a').setProp('aa', new D.MapAtom({aa: new D.BoxAtom('aa3')}))
    context.tick()
    expect(aaP.getValue()).toBeInstanceOf(D.MapAtom)
    root.prop('a').setProp('aa', new D.BoxAtom('aa3'))
    context.tick()
    expect(aaP.getValue()).toEqual('aa3')
  })

  it('should work with derived stuff too', () => {
    const context = new D.Context()
    const foo = new D.BoxAtom('foo')
    const atom = new D.MapAtom({
      a: new D.MapAtom({
        foo,
      }),
    })

    const o = new D.DerivedMap({
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