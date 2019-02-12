import withContext from "$shared/utils/react/withContext";
import React from "react";

describe(`withContext()`, () => {
  it(`should work`, () => {
    const ctx = React.createContext<number>(0)
    const Comp = (props: {a: string, ctx: number}) => {
      return <div />
    }

    const Wrapped = withContext({ctx})(Comp)
    const a = <Wrapped a="hi" />
    // $ExpectError
    const b = <Wrapped a="hi" b="10" />
  })
})