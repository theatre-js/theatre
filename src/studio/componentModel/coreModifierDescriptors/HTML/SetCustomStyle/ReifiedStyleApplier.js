// @flow
import * as D from '$shared/DataVerse'
import _ from 'lodash'
import KeyedSideEffectRunner from '$shared/utils/KeyedSideEffectRunner'

const styleSetter = (elRef: HTMLElement, unprefixedKey: string) => {
  const key = unprefixedKey // @todo add vendor prefixes
  return (value: ?string) => {
    const finalValue = value === null || value === undefined ? '' : value
    // $FixMe
    elRef.style[key] = finalValue
  }
}

const blank = {
  apply: () => {},
  unapply: () => {},
}

export default function reifiedStyleApplier(dict: $FixMe, ticker: D.ITicker) {
  const reifiedStylesP = dict.pointer().prop('reifiedStyles')
  const proxy = D.derivations.autoProxyDerivedDict(reifiedStylesP, ticker)

  const elRefD = dict
    .pointer()
    .prop('state')
    .prop('elRef')

  const getXiguluForKey = key => {
    return D.derivations.withDeps({elRefD: elRefD}, ({elRefD}) => {
      const elRef = elRefD.getValue()

      if (!elRef) return blank
      const setter = styleSetter(elRef, key)
      return {apply: setter, unapply: () => setter(null)}
    })
  }

  const runner = new KeyedSideEffectRunner(proxy, ticker, getXiguluForKey)
  return runner
}
