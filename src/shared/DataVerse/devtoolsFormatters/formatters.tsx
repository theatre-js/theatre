import * as D from '$shared/DataVerse'
import {makeFormatter} from '$src/shared/DataVerse/devtoolsFormatters/common'

const styles = {header: 'color: rgb(232,98,0); font-style: italic;'}

makeFormatter({
  test: o => o && o.isBoxAtom === 'True',
  renderHeader: o => {
    return [
      'div',
      {},
      ['object', {object: o._value}],
      ['span', {style: styles.header}, ' (BoxAtom)'],
    ]
  },
  hasBody: false,
})

makeFormatter({
  test: o => o && o.isDictAtom === 'True',
  renderHeader: o => {
    return [
      'div',
      {},
      ['object', {object: o._internalMap}],
      ['span', {style: styles.header}, ' (DictAtom)'],
    ]
  },
  hasBody: false,
})

makeFormatter({
  test: o => o && o.isArrayAtom === 'True',
  renderHeader: o => {
    return [
      'div',
      {},
      ['object', {object: o._internalArray}],
      ['span', {style: styles.header}, ' (ArrayAtom)'],
    ]
  },
  hasBody: false,
})

console.log(
  D.atoms.dict({
    a: 'hi',
    b: D.atoms.box('hallo'),
    c: D.atoms.array([D.atoms.box('foo')]),
  }),
)
