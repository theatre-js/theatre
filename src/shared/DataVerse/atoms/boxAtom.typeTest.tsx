import boxAtom from './boxAtom'

const b = boxAtom('hi')

// ensure the box type is properly inferred
// $ExpectType string
b.getValue()

// ok
b.set('someOtherString')

// $ExpectError
b.set(10)

b.changes().tap((c: string) => {})

// $ExpectError
b.changes().tap((c: number) => {})