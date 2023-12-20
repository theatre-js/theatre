import type {Atom, Pointer} from '@theatre/dataverse'

export const collapsedMap = new WeakMap<Pointer<{}>, Atom<boolean>>()
