// @flow

declare module 'when' {
  declare type WhenPromise<T> = Promise<T> & {
    delay: (t: number) => WhenPromise<T>,
  }

  declare type Deferred = {
    promise: WhenPromise<mixed>,
    resolve: (v: mixed) => mixed,
    reject: (v: mixed) => mixed,
  }

  declare type DeferFunction = () => Deferred
  declare type When =
    {<V>(v: V): WhenPromise<V>, defer: DeferFunction}

  declare module.exports: When
}