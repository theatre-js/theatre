import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import {Pointer} from './pointer'

export type Methods<OwnMethods extends {}, SuperMethods = {}> = {
  [K in keyof OwnMethods]: (
    selfP: SelfPointer<OwnMethods, SuperMethods>,
    superP: SuperPointer<SuperMethods>,
  ) => // Here I'm checking whether the method overrides a super method ...
  K extends keyof SuperMethods // ... in which case, it should return the same value as the super
    ? AbstractDerivation<SuperMethods[K]>
    : AbstractDerivation<OwnMethods[K]>
} & {
  $$$mergedType: MergeMethods<OwnMethods, SuperMethods>
}

type MergeMethods<A, B> = {
  [K in (keyof A) | (keyof B)]: K extends keyof B
    ? B[K]
    : K extends keyof A ? A[K] : never
}

type SelfPointer<A, B> = Pointer<MergeMethods<A, B>>
type SuperPointer<A> = Pointer<A>
