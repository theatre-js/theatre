// @flow
export type MapKey = string | number

export type AddressedChangeset = {address: Array<MapKey>}

// These come from this awesome SO answer: https://stackoverflow.com/a/46333906/607997
export type False = 'False'
export type True = 'True'
export type Bool = True | False
export type If<Cond: Bool, Then, Else> = $ElementType<{'False': Else, 'True': Then}, Cond>