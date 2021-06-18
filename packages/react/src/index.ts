// // import {val} from '@theatre/shared/utils/DataVerse/Atom'
// // import type IDerivation from '@theatre/shared/utils/DataVerse/derivations/IDerivation'
// // import prism from '@theatre/shared/utils/DataVerse/derivations/prism/prism'
// // import {TickerContext} from '@theatre/shared/utils/react/TickerContext'
// import {useContext, useEffect, useMemo, useState} from "react"

// export function usePrism<T>(fn: () => T, deps: unknown[]): T {
//   const derivation = useMemo(() => prism(fn), deps)

//   return useDerivation(derivation)
// }

// export const useVal: typeof val = (p) => {
//   return usePrism(() => val(p), [p])
// }

// /**
//  * Based mostly on https://github.com/facebook/react/blob/a511dc7090523ee49ce21a08e55c41917d8af311/packages/use-subscription/src/useSubscription.js
//  */
// function useDerivation<T>(der: IDerivation<T>): T {
//   const ticker = useContext(TickerContext)

//   const [state, setState] = useState(() => der.getValue())

//   useEffect(() => {
//     let untapped = false
//     const untap = der.changes(ticker).tap((newValue) => {
//       if (untapped) return
//       setState(() => newValue)
//     })

//     setState(() => der.getValue())

//     return () => {
//       untapped = true
//       untap()
//     }
//   }, [der, ticker])

//   return state
// }

// // /**
// //  * This makes sure the prism derivation remains hot as long as the
// //  * component calling the hook is alive, but it does not
// //  * return the value of the derivation, and it does not
// //  * re-render the component if the value of the derivation changes.
// //  */
// // export function usePrismWithoutReRender<T>(
// //   fn: () => T,
// //   deps: unknown[],
// // ): IDerivation<T> {
// //   const derivation = useMemo(() => prism(fn), deps)

// //   return useDerivationWithoutReRender(derivation)
// // }

// // /**
// //  * This makes sure the derivation remains hot as long as the
// //  * component calling the hook is alive, but it does not
// //  * return the value of the derivation, and it does not
// //  * re-render the component if the value of the derivation changes.
// //  */
// // export function useDerivationWithoutReRender<T>(
// //   der: IDerivation<T>,
// // ): IDerivation<T> {
// //   useEffect(() => {
// //     const untap = der.keepHot()

// //     return () => {
// //       untap()
// //     }
// //   }, [der])

// //   return der
// // }

export {}
