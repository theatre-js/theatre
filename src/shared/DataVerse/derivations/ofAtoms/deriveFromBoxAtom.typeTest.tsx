import boxAtom from '$shared/DataVerse/atomsDeprecated/boxAtom'

const b = boxAtom('hi')

const d = b.derivation()

// $ExpectType string
d.getValue()

// $ExpectError
d.getValue() as number
