export type PathBasedReducer<S> = {
  <
    A0 extends keyof S,
    A1 extends keyof S[A0],
    A2 extends keyof S[A0][A1],
    A3 extends keyof S[A0][A1][A2],
    A4 extends keyof S[A0][A1][A2][A3],
    A5 extends keyof S[A0][A1][A2][A3][A4],
    A6 extends keyof S[A0][A1][A2][A3][A4][A5],
    A7 extends keyof S[A0][A1][A2][A3][A4][A5][A6],
    A8 extends keyof S[A0][A1][A2][A3][A4][A5][A6][A7],
    A9 extends keyof S[A0][A1][A2][A3][A4][A5][A6][A7][A8],
    A10 extends keyof S[A0][A1][A2][A3][A4][A5][A6][A7][A8][A9]
  >(
    addr: [A0, A1, A2, A3, A4, A5, A6, A7, A8, A9, A10],
    reducer: (
      d: S[A0][A1][A2][A3][A4][A5][A6][A7][A8][A9][A10],
    ) => S[A0][A1][A2][A3][A4][A5][A6][A7][A8][A9][A10],
  ): mixed

  <
    A0 extends keyof S,
    A1 extends keyof S[A0],
    A2 extends keyof S[A0][A1],
    A3 extends keyof S[A0][A1][A2],
    A4 extends keyof S[A0][A1][A2][A3],
    A5 extends keyof S[A0][A1][A2][A3][A4],
    A6 extends keyof S[A0][A1][A2][A3][A4][A5],
    A7 extends keyof S[A0][A1][A2][A3][A4][A5][A6],
    A8 extends keyof S[A0][A1][A2][A3][A4][A5][A6][A7],
    A9 extends keyof S[A0][A1][A2][A3][A4][A5][A6][A7][A8]
  >(
    addr: [A0, A1, A2, A3, A4, A5, A6, A7, A8, A9],
    reducer: (
      d: S[A0][A1][A2][A3][A4][A5][A6][A7][A8][A9],
    ) => S[A0][A1][A2][A3][A4][A5][A6][A7][A8][A9],
  ): mixed

  <
    A0 extends keyof S,
    A1 extends keyof S[A0],
    A2 extends keyof S[A0][A1],
    A3 extends keyof S[A0][A1][A2],
    A4 extends keyof S[A0][A1][A2][A3],
    A5 extends keyof S[A0][A1][A2][A3][A4],
    A6 extends keyof S[A0][A1][A2][A3][A4][A5],
    A7 extends keyof S[A0][A1][A2][A3][A4][A5][A6],
    A8 extends keyof S[A0][A1][A2][A3][A4][A5][A6][A7]
  >(
    addr: [A0, A1, A2, A3, A4, A5, A6, A7, A8],
    reducer: (
      d: S[A0][A1][A2][A3][A4][A5][A6][A7][A8],
    ) => S[A0][A1][A2][A3][A4][A5][A6][A7][A8],
  ): mixed

  <
    A0 extends keyof S,
    A1 extends keyof S[A0],
    A2 extends keyof S[A0][A1],
    A3 extends keyof S[A0][A1][A2],
    A4 extends keyof S[A0][A1][A2][A3],
    A5 extends keyof S[A0][A1][A2][A3][A4],
    A6 extends keyof S[A0][A1][A2][A3][A4][A5],
    A7 extends keyof S[A0][A1][A2][A3][A4][A5][A6]
  >(
    addr: [A0, A1, A2, A3, A4, A5, A6, A7],
    reducer: (
      d: S[A0][A1][A2][A3][A4][A5][A6][A7],
    ) => S[A0][A1][A2][A3][A4][A5][A6][A7],
  ): mixed

  <
    A0 extends keyof S,
    A1 extends keyof S[A0],
    A2 extends keyof S[A0][A1],
    A3 extends keyof S[A0][A1][A2],
    A4 extends keyof S[A0][A1][A2][A3],
    A5 extends keyof S[A0][A1][A2][A3][A4],
    A6 extends keyof S[A0][A1][A2][A3][A4][A5]
  >(
    addr: [A0, A1, A2, A3, A4, A5, A6],
    reducer: (
      d: S[A0][A1][A2][A3][A4][A5][A6],
    ) => S[A0][A1][A2][A3][A4][A5][A6],
  ): mixed

  <
    A0 extends keyof S,
    A1 extends keyof S[A0],
    A2 extends keyof S[A0][A1],
    A3 extends keyof S[A0][A1][A2],
    A4 extends keyof S[A0][A1][A2][A3],
    A5 extends keyof S[A0][A1][A2][A3][A4]
  >(
    addr: [A0, A1, A2, A3, A4, A5],
    reducer: (d: S[A0][A1][A2][A3][A4][A5]) => S[A0][A1][A2][A3][A4][A5],
  ): mixed

  <
    A0 extends keyof S,
    A1 extends keyof S[A0],
    A2 extends keyof S[A0][A1],
    A3 extends keyof S[A0][A1][A2],
    A4 extends keyof S[A0][A1][A2][A3]
  >(
    addr: [A0, A1, A2, A3, A4],
    reducer: (d: S[A0][A1][A2][A3][A4]) => S[A0][A1][A2][A3][A4],
  ): mixed

  <
    A0 extends keyof S,
    A1 extends keyof S[A0],
    A2 extends keyof S[A0][A1],
    A3 extends keyof S[A0][A1][A2]
  >(
    addr: [A0, A1, A2, A3],
    reducer: (d: S[A0][A1][A2][A3]) => S[A0][A1][A2][A3],
  ): mixed

  <A0 extends keyof S, A1 extends keyof S[A0], A2 extends keyof S[A0][A1]>(
    addr: [A0, A1, A2],
    reducer: (d: S[A0][A1][A2]) => S[A0][A1][A2],
  ): mixed

  <A0 extends keyof S, A1 extends keyof S[A0]>(
    addr: [A0, A1],
    reducer: (d: S[A0][A1]) => S[A0][A1],
  ): mixed

  <A0 extends keyof S>(addr: [A0], reducer: (d: S[A0]) => S[A0]): mixed

  (addr: undefined[], reducer: (d: S) => S): mixed
}

// type Stu = {
//   a: {
//     aa: {
//       aas: string
//       aan: number
//     }
//     ab: {
//       abs: string
//       abrs: Array<string>
//     }
//   }
//   bs: string
//   c: {
//     cs: string
//     cn: number
//   }
// }

// const rudu: Rudu = ((addr: $FixMe, r: $FixMe): mixed => addr[r]) as $FixMe

// rudu(['bs'], (s: string) => '10')
// rudu(['bs'], (s: number) => '2')

// rudu(['a'], s => s)
// rudu(['a'], (s: Stu['a']) => ({
//   aa: {aas: 'hi', aan: 10},
//   ab: {abs: 'hi', abrs: ['s']},
// }))
// rudu(['a'], (s: Stu['a']) => ({
//   aa: {aas: 'hi', aan: 10},
//   ab: {abs: 'hi', abrs: [10]},
// }))
