import putToChannel from './putToChannel'
import combineChannels from './combineChannels'
import channelFromEmitter from './channelFromEmitter'

declare type Fn0<R> = () =>
  | Generator_<$FixMe, R, $FixMe>
  | Promise<R>
  | Generator_<$FixMe, R, $FixMe>
declare type Fn1<T1, R> = (
  t1: T1,
) => R | Promise<R> | Generator_<$FixMe, R, $FixMe>
declare type Fn2<T1, T2, R> = (
  t1: T1,
  t2: T2,
) => R | Promise<R> | Generator_<$FixMe, R, $FixMe>
declare type Fn3<T1, T2, T3, R> = (
  t1: T1,
  t2: T2,
  t3: T3,
) => R | Promise<R> | Generator_<$FixMe, R, $FixMe>
declare type Fn4<T1, T2, T3, T4, R> = (
  t1: T1,
  t2: T2,
  t3: T3,
  t4: T4,
) => R | Promise<R> | Generator_<$FixMe, R, $FixMe>
declare type Fn5<T1, T2, T3, T4, T5, R> = (
  t1: T1,
  t2: T2,
  t3: T3,
  t4: T4,
  t5: T5,
) => R | Promise<R> | Generator_<$FixMe, R, $FixMe>
declare type Fn6<T1, T2, T3, T4, T5, T6, R> = (
  t1: T1,
  t2: T2,
  t3: T3,
  t4: T4,
  t5: T5,
  t6: T6,
) => R | Promise<R> | Generator_<$FixMe, R, $FixMe>

declare type CallFn = (<R, Fn extends Fn0<R>>(fn: Fn) => R) &
  (<T1, R, Fn extends Fn1<T1, R>>(fn: Fn, t1: T1) => R) &
  (<T1, T2, R, Fn extends Fn2<T1, T2, R>>(fn: Fn, t1: T1, t2: T2) => R) &
  (<T1, T2, T3, R, Fn extends Fn3<T1, T2, T3, R>>(
    fn: Fn,
    t1: T1,
    t2: T2,
    t3: T3,
  ) => R) &
  (<T1, T2, T3, T4, R, Fn extends Fn4<T1, T2, T3, T4, R>>(
    fn: Fn,
    t1: T1,
    t2: T2,
    t3: T3,
    t4: T4,
  ) => R) &
  (<T1, T2, T3, T4, T5, R, Fn extends Fn5<T1, T2, T3, T4, T5, R>>(
    fn: Fn,
    t1: T1,
    t2: T2,
    t3: T3,
    t4: T4,
    t5: T5,
  ) => R) &
  (<T1, T2, T3, T4, T5, T6, R, Fn extends Fn6<T1, T2, T3, T4, T5, T6, R>>(
    fn: Fn,
    t1: T1,
    t2: T2,
    t3: T3,
    t4: T4,
    t5: T5,
    t6: T6,
  ) => R)

export {channelFromEmitter, putToChannel, combineChannels}
