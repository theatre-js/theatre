export type PathBasedReducer<S, ReturnType> = {
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
  ): ReturnType

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
  ): ReturnType

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
  ): ReturnType

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
  ): ReturnType

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
  ): ReturnType

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
  ): ReturnType

  <
    A0 extends keyof S,
    A1 extends keyof S[A0],
    A2 extends keyof S[A0][A1],
    A3 extends keyof S[A0][A1][A2],
    A4 extends keyof S[A0][A1][A2][A3]
  >(
    addr: [A0, A1, A2, A3, A4],
    reducer: (d: S[A0][A1][A2][A3][A4]) => S[A0][A1][A2][A3][A4],
  ): ReturnType

  <
    A0 extends keyof S,
    A1 extends keyof S[A0],
    A2 extends keyof S[A0][A1],
    A3 extends keyof S[A0][A1][A2]
  >(
    addr: [A0, A1, A2, A3],
    reducer: (d: S[A0][A1][A2][A3]) => S[A0][A1][A2][A3],
  ): ReturnType

  <A0 extends keyof S, A1 extends keyof S[A0], A2 extends keyof S[A0][A1]>(
    addr: [A0, A1, A2],
    reducer: (d: S[A0][A1][A2]) => S[A0][A1][A2],
  ): ReturnType

  <A0 extends keyof S, A1 extends keyof S[A0]>(
    addr: [A0, A1],
    reducer: (d: S[A0][A1]) => S[A0][A1],
  ): ReturnType

  <A0 extends keyof S>(addr: [A0], reducer: (d: S[A0]) => S[A0]): ReturnType

  (addr: undefined[], reducer: (d: S) => S): ReturnType
}
