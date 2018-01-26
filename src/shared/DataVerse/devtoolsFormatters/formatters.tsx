import {makeFormatter} from '$src/shared/DataVerse/devtoolsFormatters/common'
import {
  skipFindingColdDerivations,
  endSkippingColdDerivations,
} from '$src/shared/debug'
import {map, times} from 'lodash'

const styles = {
  header: 'color: #7F7F7F; font-style: italic;',
  key: 'color: #DC70E5;',
  indent: 'margin-left: 1em;',
}

const obj = (v: mixed) =>
  typeof v === 'undefined' ? ['span', {}, 'undefined'] : ['object', {object: v}]

// const pairing = (k, v) => ({
//   k, v, ___isPairing: true,
// })

makeFormatter({
  test: o => o && o.isBoxAtom === true,
  renderHeader: o => {
    return [
      'div',
      {},
      ['span', {style: styles.header}, 'BoxAtom '],
      ['object', {object: o._value}],
    ]
  },
  hasBody: false,
})

makeFormatter({
  test: o => o && o.isDictAtom === true,
  renderHeader: o => {
    return [
      'div',
      {},
      [
        'span',
        {style: styles.header},
        `DictAtom(${Object.keys(o._internalMap).length})`,
      ],
    ]
  },
  hasBody: true,
  body(o) {
    const lis = map(Object.keys(o._internalMap), k => {
      return [
        'div',
        {},
        ['span', {style: styles.key + styles.indent}, `${k}: `],
        ['object', {object: o._internalMap[k]}],
      ]
    })
    return ['div', {}, ...lis]
  },
})

makeFormatter({
  test: o => o && o.isArrayAtom === true,
  renderHeader: o => {
    return [
      'div',
      {},
      ['span', {style: styles.header}, ' A[] '],
      ['object', {object: o._internalArray}],
    ]
  },
  hasBody: false,
})

makeFormatter({
  test: o => o && o.isPointer === true,
  renderHeader: o => {
    const name = 'Pointer'
    return ['div', {}, ['span', {style: styles.header}, `${name} `]]
  },
  hasBody: true,
  body(o) {
    skipFindingColdDerivations()
    const v = o.getValue()
    endSkippingColdDerivations()

    return [
      'div',
      {},
      [
        'div',
        {style: styles.indent},
        ['span', {style: styles.key}, 'address: '],
        ['object', {object: o._address}],
      ],
      [
        'div',
        {style: styles.indent},
        ['span', {style: styles.key}, 'value: '],
        obj(v),
      ],
    ]
  },
})

makeFormatter({
  test: o => o && o.isDerivation === true,
  renderHeader: o => {
    const name = o.constructor.displayName || o.constructor.name || 'Unkown'

    skipFindingColdDerivations()
    const v = o.getValue()
    endSkippingColdDerivations()

    let val: any[] = []

    if (typeof v !== 'object' || v === null) {
      val = [obj(v)]
    }

    return ['div', {}, ['span', {style: styles.header}, `${name} `], ...val]
  },
  hasBody: o => {
    skipFindingColdDerivations()
    const v = o.getValue()
    endSkippingColdDerivations()

    let val: any[] = []

    if (typeof v !== 'object' || v === null) {
      return false
    } else {
      return true
    }
  },
  body(o) {
    skipFindingColdDerivations()
    const v = o.getValue()
    endSkippingColdDerivations()
    return ['div', {style: styles.indent}, obj(v)]
  },
})

makeFormatter({
  test: o => o && o.isDerivedClassInstance === true,
  renderHeader: o => {
    return [
      'div',
      {},
      [
        'span',
        {style: styles.header, title: 'ptf'},
        `DerivedClassInstance(${Object.keys(o.keys()).length})`,
      ],
      // ['object', {object: v}],
    ]
  },
  hasBody: true,
  body: o => {
    const keys = o.keys()
    const lis = map(keys, (_, k) => {
      // return ['object', {object: k}]
      return [
        'div',
        {},
        ['span', {style: styles.key + styles.indent}, `${k}: `],
        ['object', {object: o.prop(k)}],
      ]
      // return ['li', {}, k]
    })
    return ['div', {}, ...lis]
  },
})

makeFormatter({
  test: o => o && o.isDerivedDict === true,
  renderHeader: o => {
    return [
      'div',
      {},
      [
        'span',
        {style: styles.header},
        `DerivedDict(${Object.keys(o.keys()).length}) `,
      ],
      // ['object', {object: v}],
    ]
  },
  hasBody: true,
  body: o => {
    const keys = o.keys()
    const lis = map(keys, k => {
      return [
        'div',
        {},
        ['span', {style: styles.key}, `${k}: `],
        ['object', {object: o.prop(k)}],
      ]
    })
    return ['div', {}, ...lis]
  },
})

makeFormatter({
  test: o => o && o.isDerivedArray === true,
  renderHeader: o => {
    return [
      'div',
      {},
      ['span', {style: styles.header}, `DerivedArray(${o.length()})`],
      // ['object', {object: v}],
    ]
  },
  hasBody: true,
  body: o => {
    const lis = times(o.length(), i => {
      // return ['object', {object: k}]
      return [
        'div',
        {},
        ['span', {style: styles.key}, `${i}: `],
        ['object', {object: o.index(i)}],
      ]
      // return ['li', {}, k]
    })
    return ['div', {}, ...lis]
  },
})
