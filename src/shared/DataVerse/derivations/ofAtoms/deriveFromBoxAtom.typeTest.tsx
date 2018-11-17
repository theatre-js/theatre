import boxAtom from '$shared/DataVerse/deprecated/atoms/boxAtom'

const b = boxAtom('hi')

const d = b.derivation()

// $ExpectType string
d.getValue()

// $ExpectError
d.getValue() as number
