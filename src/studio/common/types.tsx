import * as t from '$shared/ioTypes'
export const $ICommonNamespaceState = t.type({}, 'ICommonNamespaceState')

export type ICommonNamespaceState = t.StaticTypeOf<
  typeof $ICommonNamespaceState
>
