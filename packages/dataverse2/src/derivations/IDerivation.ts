import type Tappable from '../utils/Tappable'

export type GraphNode = {
  height: number
  recalculate(): void
}

export interface IDerivation<V> {
  isDerivation: true
  isHot: boolean
  changes(): Tappable<V>

  addDependent(d: GraphNode): void
  removeDependent(d: GraphNode): void

  reportDependentHeightChange(d: GraphNode): void

  getValue(): V

  map<T>(fn: (v: V) => T): IDerivation<T>

  flatMap<R>(
    fn: (v: V) => R,
  ): IDerivation<R extends IDerivation<infer T> ? T : R>
}

export function isDerivation(d: any): d is IDerivation<unknown> {
  return d && d.isDerivation && d.isDerivation === true
}
