import dictAtom from '$shared/DataVerse/atoms/dictAtom'
import Ticker from '$shared/DataVerse/Ticker';

describe(`keysOfDerivedDict`, () => {
  it(`should work`, () => {
    const d = dictAtom<{a: string; b?: string; c?: string}>({
      a: 'hi',
    })

    const dDerived = d.derivedDict()
    const keysD = dDerived.keysD()
    expect(keysD.getValue()).toMatchObject(['a'])
    const t = new Ticker()
    const changes: Array<$IntentionalAny> = []
    keysD.changes(t).tap((c) => {
      changes.push(c)
    })
    d.setProp('b', 'hi')
    t.tick()
    expect(changes[0]).toMatchObject(['a', 'b'])
    d.deleteProp('b')
    t.tick()
    expect(changes[1]).toMatchObject(['a'])
  })
})
