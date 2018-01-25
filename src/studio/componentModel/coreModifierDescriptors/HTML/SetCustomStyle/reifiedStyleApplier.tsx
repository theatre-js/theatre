import * as D from '$shared/DataVerse'
import KeyedSideEffectRunner from '$shared/utils/KeyedSideEffectRunner'
import Ticker from '$src/shared/DataVerse/Ticker'

const styleSetter = (elRef: HTMLElement, unprefixedKey: string) => {
  const key = unprefixedKey // @todo add vendor prefixes
  return (value: undefined | null | string) => {
    const finalValue = value === null || value === undefined ? '' : value
    // $FixMe
    elRef.style[key] = finalValue
  }
}

const blank = {
  apply: () => {},
  unapply: () => {},
}

export default function reifiedStyleApplier(dict: $FixMe, ticker: Ticker) {
  const reifiedStylesP = dict.pointer().prop('reifiedStyles')
  const proxy = D.derivations.autoProxyDerivedDict(reifiedStylesP, ticker)

  const elRefD = dict
    .pointer()
    .prop('state')
    .prop('elRef')

  const getApplyAndUnapplyForKey = (key: string) => {
    return D.derivations.withDeps({elRefD: elRefD}, ({elRefD}) => {
      const elRef = elRefD.getValue()

      if (!elRef) return blank
      const setter = styleSetter(elRef, key)
      return {apply: setter, unapply: () => setter(null)}
    })
  }

  const runner = new KeyedSideEffectRunner(
    proxy,
    ticker,
    getApplyAndUnapplyForKey,
  )
  return runner
}
