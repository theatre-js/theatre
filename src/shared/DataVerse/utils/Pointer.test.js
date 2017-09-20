// @flow
import Pointer from './Pointer'
import * as D from '$shared/DataVerse'

describe('Pointer', () => {
  it('should work', () => {
    const root = new D.MapAtom({
      a: new D.MapAtom({
        aa: new D.BoxAtom('aa'),
        bb: new D.BoxAtom('bb'),
      }),
    })
    const aaP = root.prop('a').prop('aa').pointer()
    expect(aaP.derivation().getValue()).toEqual('aa')
    root.prop('a').prop('aa').set('aa2')
    expect(aaP.derivation().getValue()).toEqual('aa2')
    root.prop('a').deleteProp('aa')
    expect(aaP.derivation().getValue()).toEqual(Pointer.NOTFOUND)
    root.prop('a').setProp('aa', new D.MapAtom({}))
    expect(aaP.derivation().getValue()).toEqual(Pointer.NOTFOUND)
    root.prop('a').setProp('aa', new D.MapAtom({aa: new D.BoxAtom('aa3')}))
    expect(aaP.derivation().getValue()).toEqual(Pointer.NOTFOUND)
    root.prop('a').setProp('aa', new D.BoxAtom('aa3'))
    expect(aaP.derivation().getValue()).toEqual('aa3')
  })

  it('should work', () => {
    const root = new D.MapAtom({
      a: new D.MapAtom({
        aa: new D.BoxAtom('aa'),
        bb: new D.BoxAtom('bb'),
      }),
    })
    const aaP = root.prop('a').prop('aa').pointer().derivation()
    const context = new D.Context()
    aaP.setDataVerseContext(context)
    const changes = []
    aaP.changes().tap((c) => {changes.push(c)})
    expect(aaP.getValue()).toEqual('aa')
    root.prop('a').prop('aa').set('aa2')
    context.tick()
    expect(aaP.getValue()).toEqual('aa2')
    root.prop('a').deleteProp('aa')
    context.tick()
    expect(aaP.getValue()).toEqual(Pointer.NOTFOUND)
    root.prop('a').setProp('aa', new D.MapAtom({}))
    context.tick()
    expect(aaP.getValue()).toEqual(Pointer.NOTFOUND)
    root.prop('a').setProp('aa', new D.MapAtom({aa: new D.BoxAtom('aa3')}))
    context.tick()
    expect(aaP.getValue()).toEqual(Pointer.NOTFOUND)
    root.prop('a').setProp('aa', new D.BoxAtom('aa3'))
    context.tick()
    expect(aaP.getValue()).toEqual('aa3')

    console.log(changes)
  })
})