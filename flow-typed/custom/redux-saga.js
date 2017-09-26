/* eslint-disable */

/**
 * Shared interfaces between the modules 'redux-saga' and
 * 'redux-saga/effects'
 */
declare interface $npm$ReduxSaga$Channel {
  take: (cb: (msg: mixed) => void) => void,
  put: (msg: mixed) => void,
  close: Function,
}

declare type $npm$ReduxSaga$Task = {
  '@@redux-saga/TASK': true,
  isRunning: () => boolean;
  isCancelled: () => boolean;
  result: () => ?mixed;
  error: () => ?Error;
  cancel: () => void;
  done?: Promise<*>;
}

declare interface $npm$ReduxSaga$Buffer {
  isEmpty(): boolean;
  put(msg: any): void;
  take(): any;
}

declare type $npm$ReduxSaga$IOEffect = {
  '@@redux-saga/IO': true,
}

declare module 'redux-saga' {
  // Parts for the Channel interface
  declare type EmitterFn = (msg: any) => void;
  declare type UnsubscribeFn = () => void;
  declare type SubscribeFn = (emitter: EmitterFn) => UnsubscribeFn;
  declare type MatcherFn = (msg: any) => boolean;

  declare type Pattern = string | Array<string> | (action: Object) => boolean;

  declare type IOEffect = $npm$ReduxSaga$IOEffect;
  declare export type Channel = $npm$ReduxSaga$Channel;
  declare export type Buffer = $npm$ReduxSaga$Buffer;
  declare export type Task = $npm$ReduxSaga$Task;

  declare export interface SagaMonitor {
    effectTriggered(options: {
      effectId: number,
      parentEffectId: number,
      label: string,
      effect: Object,
    }): void;
    effectResolved(effectId: number, result: any): void;
    effectRejected(effectId: number, err: any): void;
    effectCancelled(effectId: number): void;
  }

  declare export type Logger = (level: 'info'|'warning'|'error', ...args: Array<any>) => void;

  declare export var eventChannel: {
    (sub: SubscribeFn, buffer?: Buffer, matcher?: MatcherFn): Channel,
  };

  declare export var buffers: {
    none: () => Buffer,
    fixed: (limit: ?number) => Buffer,
    dropping: (limit: ?number) => Buffer,
    sliding: (limit: ?number) => Buffer,
    expanding: (initialSize: ?number) => Buffer,
  }

  declare export var channel: (buffer?: Buffer) => Channel;
  declare export var END: { type: '@@redux-saga/CHANNEL_END' };

  /**
   * Saga stuff
   */

  declare type SagaSpread<Y: IOEffect, R, N, T> = (...args: Array<T>) => Generator<Y, R, N>;
  declare type SagaList<Y: IOEffect[], R, N> = () => Generator<Y, R, N>;
  declare type Saga0<Y: IOEffect, R, N> = () => Generator<Y, R, N>;
  declare type Saga1<Y: IOEffect, R, N, T1> = (t1: T1) => Generator<Y, R, N>;
  declare type Saga2<Y: IOEffect, R, N, T1, T2> = (t1: T1, t2: T2) => Generator<Y, R, N>;
  declare type Saga3<Y: IOEffect, R, N, T1, T2, T3> = (t1: T1, t2: T2, t3: T3) => Generator<Y, R, N>;
  declare type Saga4<Y: IOEffect, R, N, T1, T2, T3, T4> = (t1: T1, t2: T2, t3: T3, t4: T4) => Generator<Y, R, N>;
  declare type Saga5<Y: IOEffect, R, N, T1, T2, T3, T4, T5> = (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5) => Generator<Y, R, N>;
  declare type Saga6<Y: IOEffect, R, N, T1, T2, T3, T4, T5, T6> = (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6) => Generator<Y, R, N>;

  declare interface FsmIterator extends Generator<*,*,*> {
    name: string,
  }

  declare type TakeXFn =
     & (<Y, R, N, Fn: Saga0<Y, R, N>>(pattern: Pattern, saga: Fn) => FsmIterator)
     & (<T1, Y, R, N, Fn: Saga1<Y, R, N, T1>>(pattern: Pattern, saga: Fn, t1: T1) => FsmIterator)
     & (<T1, T2, Y, R, N, Fn: Saga2<Y, R, N, T1, T2>>(pattern: Pattern, saga: Fn, t1: T1, t2: T2) => FsmIterator)
     & (<T1, T2, T3, Y, R, N, Fn: Saga3<Y, R, N, T1, T2, T3>>(pattern: Pattern, saga: Fn, t1: T1, t2: T2, t3: T3) => FsmIterator)
     & (<T1, T2, T3, T4, Y, R, N, Fn: Saga4<Y, R, N, T1, T2, T3, T4>>(pattern: Pattern, saga: Fn, t1: T1, t2: T2, t3: T3, t4: T4) => FsmIterator)
     & (<T1, T2, T3, T4, T5, Y, R, N, Fn: Saga5<Y, R, N, T1, T2, T3, T4, T5>>(pattern: Pattern, saga: Fn, t1: T1, t2: T2, t3: T3, t4: T4, t5: T5) => FsmIterator)
     & (<T1, T2, T3, T4, T5, T6, Y, R, N, Fn: Saga6<Y, R, N, T1, T2, T3, T4, T5, T6>>(pattern: Pattern, saga: Fn, t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6) => FsmIterator)
     & (<T, Y, R, N, Fn: SagaSpread<Y, R, N, T>>(pattern: Pattern, saga: Fn, ...rest: Array<T>) => FsmIterator);

  declare export var takeEvery: TakeXFn;
  declare export var takeLatest: TakeXFn;

  declare type ThrottleFn =
     & (<Y, R, N, Fn: Saga0<Y, R, N>>(delayLength: number, pattern: Pattern, saga: Fn) => FsmIterator)
     & (<T1, Y, R, N, Fn: Saga1<Y, R, N, T1>>(delayLength: number, pattern: Pattern, saga: Fn, t1: T1) => FsmIterator)
     & (<T1, T2, Y, R, N, Fn: Saga2<Y, R, N, T1, T2>>(delayLength: number, pattern: Pattern, saga: Fn, t1: T1, t2: T2) => FsmIterator)
     & (<T1, T2, T3, Y, R, N, Fn: Saga3<Y, R, N, T1, T2, T3>>(delayLength: number, pattern: Pattern, saga: Fn, t1: T1, t2: T2, t3: T3) => FsmIterator)
     & (<T1, T2, T3, T4, Y, R, N, Fn: Saga4<Y, R, N, T1, T2, T3, T4>>(delayLength: number, pattern: Pattern, saga: Fn, t1: T1, t2: T2, t3: T3, t4: T4) => FsmIterator)
     & (<T1, T2, T3, T4, T5, Y, R, N, Fn: Saga5<Y, R, N, T1, T2, T3, T4, T5>>(delayLength: number, pattern: Pattern, saga: Fn, t1: T1, t2: T2, t3: T3, t4: T4, t5: T5) => FsmIterator)
     & (<T1, T2, T3, T4, T5, T6, Y, R, N, Fn: Saga6<Y, R, N, T1, T2, T3, T4, T5, T6>>(delayLength: number, pattern: Pattern, saga: Fn, t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6) => FsmIterator)
     & (<T, Y, R, N, Fn: SagaSpread<Y, R, N, T>>(delayLength: number, pattern: Pattern, saga: Fn, ...rest: Array<T>) => FsmIterator);

  declare export var throttle: ThrottleFn;

  declare export var delay: <T>(ms: number, val?: T) => Promise<T>;
  declare export var CANCEL: Symbol;

  declare type RunSagaCb = (input: any) => any;

  // TODO: make this interface less generic,...
  declare export var runSaga: (
    iterator: Generator<*,*,*>,
    options?: {
      subscribe?: (cb: RunSagaCb) => UnsubscribeFn,
      dispatch?: (output: any) => any,
      getState?: () => any,
      sagaMonitor?: SagaMonitor,
      logger?: Logger,
    }
  ) => Task;

  // Not fully typed because it's not really official API
  declare export var utils: {
    createMockTask: () => Task,
  };

  declare export var effects: {};

  declare type MiddlewareRunFn =
    & (<Y, R, N, Fn: SagaList<Y, R, N>>(saga: Fn) => Task)
    & (<Y, R, N, Fn: Saga0<Y, R, N>>(saga: Fn, ...rest: Array<void>) => Task)
    & (<T1, Y, R, N, Fn: Saga1<Y, R, N, T1>>(saga: Fn, t1: T1, ...rest: Array<void>) => Task)
    & (<T1, T2, Y, R, N, Fn: Saga2<Y, R, N, T1, T2>>(saga: Fn, t1: T1, t2: T2, ...rest: Array<void>) => Task)
    & (<T1, T2, T3, Y, R, N, Fn: Saga3<Y, R, N, T1, T2, T3>>(saga: Fn, t1: T1, t2: T2, t3: T3, ...rest: Array<void>) => Task)
    & (<T1, T2, T3, T4, Y, R, N, Fn: Saga4<Y, R, N, T1, T2, T3, T4>>(saga: Fn, t1: T1, t2: T2, t3: T3, t4: T4, ...rest: Array<void>) => Task)
    & (<T1, T2, T3, T4, T5, Y, R, N, Fn: Saga5<Y, R, N, T1, T2, T3, T4, T5>>(saga: Fn, t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, ...rest: Array<void>) => Task)
    & (<T1, T2, T3, T4, T5, T6, Y, R, N, Fn: Saga6<Y, R, N, T1, T2, T3, T4, T5, T6>>(saga: Fn, t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6, ...rest: Array<void>) => Task)
    & (<T, Y, R, N, Fn: SagaSpread<Y, R, N, T>>(saga: Fn, t1: T, t2: T, t3: T, t4: T, t5: T, t6: T, ...rest: Array<void>) => Task)

  declare interface SagaMiddleware {
    // TODO: This should be aligned with the official redux typings sometime
    (api: any): (next: any) => any;
    run: MiddlewareRunFn;
  }

  declare type createSagaMiddleware = (
    options?: {
      sagaMonitor?: SagaMonitor,
      logger?: Logger,
      onError?: Function,
    }
  ) => SagaMiddleware;

  declare export default createSagaMiddleware;
}

declare module 'redux-saga/effects' {
  // Aliases from the global scope
  declare type IOEffect = $npm$ReduxSaga$IOEffect;
  declare type Channel = $npm$ReduxSaga$Channel;
  declare type Buffer = $npm$ReduxSaga$Buffer;
  declare type Task = $npm$ReduxSaga$Task;

  declare type TakeEffect<P> = $npm$ReduxSaga$IOEffect & {
    TAKE: {
      channel: ?Channel,
      pattern: P,
    },
  };

  declare type PutEffect<T> = $npm$ReduxSaga$IOEffect & {
    PUT: {
      channel: ?Channel,
      action: T,
    },
  };

  declare type CallEffect<C, Fn, Args> = $npm$ReduxSaga$IOEffect & {
    CALL: {
      context: C,
      fn: Fn,
      args: Args,
    },
  };

  declare type ForkEffect<C, Fn, Args> = $npm$ReduxSaga$IOEffect & {
    FORK: {
      context: C,
      fn: Fn,
      args: Args,
    }
  }

  declare type CpsEffect<C, Fn, Args> = $npm$ReduxSaga$IOEffect & {
    CPS: {
      context: C,
      fn: Fn,
      args: Args,
    }
  }

  declare type SelectEffect<Fn, Args> = $npm$ReduxSaga$IOEffect & {
    SELECT: {
      selector: Fn,
      args: Args,
    }
  }

  declare type SpawnEffect<C, Fn, Args> = $npm$ReduxSaga$IOEffect & {
    FORK: {
      context: C,
      fn: Fn,
      args: Args,
      detached: true,
    }
  }

  declare type ActionChannelEffect<P> = $npm$ReduxSaga$IOEffect & {
    ACTION_CHANNEL: {
      pattern: P,
      buffer: ?$npm$ReduxSaga$Buffer,
    }
  }

  // Apparently, the effects use a stripped
  // version of a Task object
  // Since there is some private API in there,
  // we don't expose this in the Type interface
  // to prevent misuse
  declare type EffectTask = {
    '@@redux-saga/TASK': true,
    isRunning: () => boolean;
    isCancelled: () => boolean;
    result: () => ?mixed;
    error: () => ?Error;
    done?: Promise<*>;
  }

  declare type JoinEffect = $npm$ReduxSaga$IOEffect & {
    JOIN: EffectTask,
  }

  declare type CancelEffect = $npm$ReduxSaga$IOEffect & {
    CANCEL: EffectTask,
  }

  declare type RaceEffect<T> = $npm$ReduxSaga$IOEffect & {
    RACE: $Shape<T>,
  }

  declare type CancelledEffect = $npm$ReduxSaga$IOEffect & {
    CANCELLED: Object,
  }

  declare type FlushEffect = $npm$ReduxSaga$IOEffect & {
    FLUSH: Channel,
  }

  declare type Pattern = string | Array<string> | (action: Object) => boolean;

  declare type FnSpread<T, R> = (...args: Array<T>) => R | Promise<R>;

  declare type Fn0<R> = () => R | Promise<R> | Generator<*,R,*>;
  declare type Fn1<T1, R> = (t1: T1) => R | Promise<R> | Generator<*,R,*>;
  declare type Fn2<T1, T2, R> = (t1: T1, t2: T2) => R | Promise<R> | Generator<*,R,*>;
  declare type Fn3<T1, T2, T3, R> = (t1: T1, t2: T2, t3: T3) => R | Promise<R> | Generator<*,R,*>;
  declare type Fn4<T1, T2, T3, T4, R> = (t1: T1, t2: T2, t3: T3, t4: T4) => R | Promise<R> | Generator<*,R,*>;
  declare type Fn5<T1, T2, T3, T4, T5, R> = (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5) => R | Promise<R> | Generator<*,R,*>;
  declare type Fn6<T1, T2, T3, T4, T5, T6, R> = (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6) => R | Promise<R> | Generator<*,R,*>;

  declare type SelectFnSpread<T> = (state: any, ...args: Array<T>) => any;
  declare type SelectFn0 = ((state: any) => any) & (() => any);
  declare type SelectFn1<T1> = (state: any, t1: T1) => any;
  declare type SelectFn2<T1, T2> = (state: any, t1: T1, t2: T2) => any;
  declare type SelectFn3<T1, T2, T3> = (state: any, t1: T1, t2: T2, t3: T3) => any;
  declare type SelectFn4<T1, T2, T3, T4> = (state: any, t1: T1, t2: T2, t3: T3, t4: T4) => any;
  declare type SelectFn5<T1, T2, T3, T4, T5> = (state: any, t1: T1, t2: T2, t3: T3, t4: T4, t5: T5) => any;
  declare type SelectFn6<T1, T2, T3, T4, T5, T6> = (state: any, t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6) => any;

  declare type CallEffectSpread<C, Fn, T> = CallEffect<C, Fn, Array<T>>;
  declare type CallEffect0<C, Fn> = CallEffect<C, Fn, []>;
  declare type CallEffect1<C, Fn, T1> = CallEffect<C, Fn, [T1]>;
  declare type CallEffect2<C, Fn, T1, T2> = CallEffect<C, Fn, [T1, T2]>;
  declare type CallEffect3<C, Fn, T1, T2, T3> = CallEffect<C, Fn, [T1, T2, T3]>;
  declare type CallEffect4<C, Fn, T1, T2, T3, T4> = CallEffect<C, Fn, [T1, T2, T3, T4]>;
  declare type CallEffect5<C, Fn, T1, T2, T3, T4, T5> = CallEffect<C, Fn, [T1, T2, T3, T4, T5]>;
  declare type CallEffect6<C, Fn, T1, T2, T3, T4, T5, T6> = CallEffect<C, Fn, [T1, T2, T3, T4, T5, T6]>;

  declare type ForkEffectSpread<C, Fn, T> = ForkEffect<C, Fn, Array<T>>;
  declare type ForkEffect0<C, Fn> = ForkEffect<C, Fn, []>;
  declare type ForkEffect1<C, Fn, T1> = ForkEffect<C, Fn, [T1]>;
  declare type ForkEffect2<C, Fn, T1, T2> = ForkEffect<C, Fn, [T1, T2]>;
  declare type ForkEffect3<C, Fn, T1, T2, T3> = ForkEffect<C, Fn, [T1, T2, T3]>;
  declare type ForkEffect4<C, Fn, T1, T2, T3, T4> = ForkEffect<C, Fn, [T1, T2, T3, T4]>;
  declare type ForkEffect5<C, Fn, T1, T2, T3, T4, T5> = ForkEffect<C, Fn, [T1, T2, T3, T4, T5]>;
  declare type ForkEffect6<C, Fn, T1, T2, T3, T4, T5, T6> = ForkEffect<C, Fn, [T1, T2, T3, T4, T5, T6]>;

  declare type CpsEffectSpread<C, Fn, T> = CpsEffect<C, Fn, Array<T>>;
  declare type CpsEffect0<C, Fn> = CpsEffect<C, Fn, []>;
  declare type CpsEffect1<C, Fn, T1> = CpsEffect<C, Fn, [T1]>;
  declare type CpsEffect2<C, Fn, T1, T2> = CpsEffect<C, Fn, [T1, T2]>;
  declare type CpsEffect3<C, Fn, T1, T2, T3> = CpsEffect<C, Fn, [T1, T2, T3]>;
  declare type CpsEffect4<C, Fn, T1, T2, T3, T4> = CpsEffect<C, Fn, [T1, T2, T3, T4]>;
  declare type CpsEffect5<C, Fn, T1, T2, T3, T4, T5> = CpsEffect<C, Fn, [T1, T2, T3, T4, T5]>;
  declare type CpsEffect6<C, Fn, T1, T2, T3, T4, T5, T6> = CpsEffect<C, Fn, [T1, T2, T3, T4, T5, T6]>;

  declare type SpawnEffectSpread<C, Fn, T> = SpawnEffect<C, Fn, Array<T>>;
  declare type SpawnEffect0<C, Fn> = SpawnEffect<C, Fn, []>;
  declare type SpawnEffect1<C, Fn, T1> = SpawnEffect<C, Fn, [T1]>;
  declare type SpawnEffect2<C, Fn, T1, T2> = SpawnEffect<C, Fn, [T1, T2]>;
  declare type SpawnEffect3<C, Fn, T1, T2, T3> = SpawnEffect<C, Fn, [T1, T2, T3]>;
  declare type SpawnEffect4<C, Fn, T1, T2, T3, T4> = SpawnEffect<C, Fn, [T1, T2, T3, T4]>;
  declare type SpawnEffect5<C, Fn, T1, T2, T3, T4, T5> = SpawnEffect<C, Fn, [T1, T2, T3, T4, T5]>;
  declare type SpawnEffect6<C, Fn, T1, T2, T3, T4, T5, T6> = SpawnEffect<C, Fn, [T1, T2, T3, T4, T5, T6]>;

  declare type SelectEffectSpread<Fn, T> = SelectEffect<Fn, Array<T>>;
  declare type SelectEffect0<Fn> = SelectEffect<Fn, []>;
  declare type SelectEffect1<Fn, T1> = SelectEffect<Fn, [T1]>;
  declare type SelectEffect2<Fn, T1, T2> = SelectEffect<Fn, [T1, T2]>;
  declare type SelectEffect3<Fn, T1, T2, T3> = SelectEffect<Fn, [T1, T2, T3]>;
  declare type SelectEffect4<Fn, T1, T2, T3, T4> = SelectEffect<Fn, [T1, T2, T3, T4]>;
  declare type SelectEffect5<Fn, T1, T2, T3, T4, T5> = SelectEffect<Fn, [T1, T2, T3, T4, T5]>;
  declare type SelectEffect6<Fn, T1, T2, T3, T4, T5, T6> = SelectEffect<Fn, [T1, T2, T3, T4, T5, T6]>;

  declare type Context = Object;

  /**
   * APPLY STUFF
   */
  declare type ApplyFn =
    & (<R, C: Context, Fn: Fn0<R>>(c: C, fn: Fn, ...rest: Array<void>) => CallEffect0<C, Fn>)
    & (<T1, R, C: Context, Fn: Fn1<T1, R>>(c: C, fn: Fn, t1: T1, ...rest: Array<void>) => CallEffect1<C, Fn, T1>)
    & (<T1, T2, R, C: Context, Fn: Fn2<T1, T2, R>>(c: C, fn: Fn, t1: T1, t2: T2, ...rest: Array<void>) => CallEffect2<C, Fn, T1, T2>)
    & (<T1, T2, T3, R, C: Context, Fn: Fn3<T1, T2, T3, R>>(c: C, fn: Fn, t1: T1, t2: T2, t3: T3, ...rest: Array<void>) => CallEffect3<C, Fn, T1, T2, T3>)
    & (<T1, T2, T3, T4, R, C: Context, Fn: Fn4<T1, T2, T3, T4, R>>(c: C, fn: Fn, t1: T1, t2: T2, t3: T3, t4: T4, ...rest: Array<void>) => CallEffect4<C, Fn, T1, T2, T3, T4>)
    & (<T1, T2, T3, T4, T5, R, C: Context, Fn: Fn5<T1, T2, T3, T4, T5, R>>(c: C, fn: Fn, t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, ...rest: Array<void>) => CallEffect5<C, Fn, T1, T2, T3, T4, T5>)
    & (<T1, T2, T3, T4, T5, T6, R, C: Context, Fn: Fn6<T1, T2, T3, T4, T5, T6, R>>(c: C, fn: Fn, t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6, ...rest: Array<void>) => CallEffect6<C, Fn, T1, T2, T3, T4, T5, T6>)
    & (<T, R, C: Context, Fn: FnSpread<T, R>>(c: C, fn: Fn, t1: T, t2: T, t3: T, t4: T, t5: T, t6: T, ...args: Array<T>) => CallEffectSpread<null, Fn, T>);

  /**
   * CALL STUFF
   */
  declare type ContextCallFn =
    & (<R, C: Context, Fn: Fn0<R>>(cfn: [C, Fn], ...rest: Array<void>) => CallEffect0<C, Fn>)
    & (<T1, R, C: Context, Fn: Fn1<T1, R>>(cfn: [C, Fn], t1: T1, ...rest: Array<void>) => CallEffect1<C, Fn, T1>)
    & (<T1, T2, R, C: Context, Fn: Fn2<T1, T2, R>>(cfn: [C, Fn], t1: T1, t2: T2, ...rest: Array<void>) => CallEffect2<C, Fn, T1, T2>)
    & (<T1, T2, T3, R, C: Context, Fn: Fn3<T1, T2, T3, R>>(cfn: [C, Fn], t1: T1, t2: T2, t3: T3, ...rest: Array<void>) => CallEffect3<C, Fn, T1, T2, T3>)
    & (<T1, T2, T3, T4, R, C: Context, Fn: Fn4<T1, T2, T3, T4, R>>(cfn: [C, Fn], t1: T1, t2: T2, t3: T3, t4: T4, ...rest: Array<void>) => CallEffect4<C, Fn, T1, T2, T3, T4>)
    & (<T1, T2, T3, T4, T5, R, C: Context, Fn: Fn5<T1, T2, T3, T4, T5, R>>(cfn: [C, Fn], t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, ...rest: Array<void>) => CallEffect5<C, Fn, T1, T2, T3, T4, T5>)
    & (<T1, T2, T3, T4, T5, T6, R, C: Context, Fn: Fn6<T1, T2, T3, T4, T5, T6, R>>(cfn: [C, Fn], t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6, ...rest: Array<void>) => CallEffect6<C, Fn, T1, T2, T3, T4, T5, T6>)
    & (<T, R, C: Context, Fn: FnSpread<T, R>>(cfn: [C, Fn], t1: T, t2: T, t3: T, t4: T, t5: T, t6: T, ...args: Array<T>) => CallEffectSpread<null, Fn, T>);

  declare type CallFn =
    & ContextCallFn
    & (<R, Fn: Fn0<R>>(fn: Fn) => CallEffect0<null, Fn>)
    & (<T1, R, Fn: Fn1<T1, R>>(fn: Fn, t1: T1) => CallEffect1<null, Fn, T1>)
    & (<T1, T2, R, Fn: Fn2<T1, T2, R>>(fn: Fn, t1: T1, t2: T2) => CallEffect2<null, Fn, T1, T2>)
    & (<T1, T2, T3, R, Fn: Fn3<T1, T2, T3, R>>(fn: Fn, t1: T1, t2: T2, t3: T3) => CallEffect3<null, Fn, T1, T2, T3>)
    & (<T1, T2, T3, T4, R, Fn: Fn4<T1, T2, T3, T4, R>>(fn: Fn, t1: T1, t2: T2, t3: T3, t4: T4) => CallEffect4<null, Fn, T1, T2, T3, T4>)
    & (<T1, T2, T3, T4, T5, R, Fn: Fn5<T1, T2, T3, T4, T5, R>>(fn: Fn, t1: T1, t2: T2, t3: T3, t4: T4, t5: T5) => CallEffect5<null, Fn, T1, T2, T3, T4, T5>)
    & (<T1, T2, T3, T4, T5, T6, R, Fn: Fn6<T1, T2, T3, T4, T5, T6, R>>(fn: Fn, t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6) => CallEffect6<null, Fn, T1, T2, T3, T4, T5, T6>)
    & (<T, R, Fn: FnSpread<T, R>>(fn: Fn, ...args: Array<T>) => CallEffectSpread<null, Fn, T>);

  /**
   * FORK STUFF
   */
  declare type ContextForkFn =
    & (<R, C: Context, Fn: Fn0<R>>(cfn: [C, Fn], ...rest: Array<void>) => ForkEffect0<C, Fn>)
    & (<T1, R, C: Context, Fn: Fn1<T1, R>>(cfn: [C, Fn], t1: T1, ...rest: Array<void>) => ForkEffect1<C, Fn, T1>)
    & (<T1, T2, R, C: Context, Fn: Fn2<T1, T2, R>>(cfn: [C, Fn], t1: T1, t2: T2, ...rest: Array<void>) => ForkEffect2<C, Fn, T1, T2>)
    & (<T1, T2, T3, R, C: Context, Fn: Fn3<T1, T2, T3, R>>(cfn: [C, Fn], t1: T1, t2: T2, t3: T3, ...rest: Array<void>) => ForkEffect3<C, Fn, T1, T2, T3>)
    & (<T1, T2, T3, T4, R, C: Context, Fn: Fn4<T1, T2, T3, T4, R>>(cfn: [C, Fn], t1: T1, t2: T2, t3: T3, t4: T4, ...rest: Array<void>) => ForkEffect4<C, Fn, T1, T2, T3, T4>)
    & (<T1, T2, T3, T4, T5, R, C: Context, Fn: Fn5<T1, T2, T3, T4, T5, R>>(cfn: [C, Fn], t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, ...rest: Array<void>) => ForkEffect5<C, Fn, T1, T2, T3, T4, T5>)
    & (<T1, T2, T3, T4, T5, T6, R, C: Context, Fn: Fn6<T1, T2, T3, T4, T5, T6, R>>(cfn: [C, Fn], t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6, ...rest: Array<void>) => ForkEffect6<C, Fn, T1, T2, T3, T4, T5, T6>)
    & (<T, R, C: Context, Fn: FnSpread<T, R>>(cfn: [C, Fn], t1: T, t2: T, t3: T, t4: T, t5: T, t6: T, ...args: Array<T>) => ForkEffectSpread<null, Fn, T>);

  declare type ForkFn =
    & ContextForkFn
    & (<R, Fn: Fn0<R>>(fn: Fn, ...rest: Array<void>) => ForkEffect0<null, Fn>)
    & (<T1, R, Fn: Fn1<T1, R>>(fn: Fn, t1: T1, ...rest: Array<void>) => ForkEffect1<null, Fn, T1>)
    & (<T1, T2, R, Fn: Fn2<T1, T2, R>>(fn: Fn, t1: T1, t2: T2, ...rest: Array<void>) => ForkEffect2<null, Fn, T1, T2>)
    & (<T1, T2, T3, R, Fn: Fn3<T1, T2, T3, R>>(fn: Fn, t1: T1, t2: T2, t3: T3, ...rest: Array<void>) => ForkEffect3<null, Fn, T1, T2, T3>)
    & (<T1, T2, T3, T4, R, Fn: Fn4<T1, T2, T3, T4, R>>(fn: Fn, t1: T1, t2: T2, t3: T3, t4: T4, ...rest: Array<void>) => ForkEffect4<null, Fn, T1, T2, T3, T4>)
    & (<T1, T2, T3, T4, T5, R, Fn: Fn5<T1, T2, T3, T4, T5, R>>(fn: Fn, t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, ...rest: Array<void>) => ForkEffect5<null, Fn, T1, T2, T3, T4, T5>)
    & (<T1, T2, T3, T4, T5, T6, R, Fn: Fn6<T1, T2, T3, T4, T5, T6, R>>(fn: Fn, t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6, ...rest: Array<void>) => ForkEffect6<null, Fn, T1, T2, T3, T4, T5, T6>)
    & (<T, R, Fn: FnSpread<T, R>>(fn: Fn, t1: T, t2: T, t3: T, t4: T, t5: T, t6: T, ...args: Array<T>) => ForkEffectSpread<null, Fn, T>);

  /**
   * CPS STUFF
   */
  declare type ContextCpsFn =
    & (<R, C: Context, Fn: Fn0<R>>(cfn: [C, Fn], ...rest: Array<void>) => CpsEffect0<C, Fn>)
    & (<T1, R, C: Context, Fn: Fn1<T1, R>>(cfn: [C, Fn], t1: T1, ...rest: Array<void>) => CpsEffect1<C, Fn, T1>)
    & (<T1, T2, R, C: Context, Fn: Fn2<T1, T2, R>>(cfn: [C, Fn], t1: T1, t2: T2, ...rest: Array<void>) => CpsEffect2<C, Fn, T1, T2>)
    & (<T1, T2, T3, R, C: Context, Fn: Fn3<T1, T2, T3, R>>(cfn: [C, Fn], t1: T1, t2: T2, t3: T3, ...rest: Array<void>) => CpsEffect3<C, Fn, T1, T2, T3>)
    & (<T1, T2, T3, T4, R, C: Context, Fn: Fn4<T1, T2, T3, T4, R>>(cfn: [C, Fn], t1: T1, t2: T2, t3: T3, t4: T4, ...rest: Array<void>) => CpsEffect4<C, Fn, T1, T2, T3, T4>)
    & (<T1, T2, T3, T4, T5, R, C: Context, Fn: Fn5<T1, T2, T3, T4, T5, R>>(cfn: [C, Fn], t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, ...rest: Array<void>) => CpsEffect5<C, Fn, T1, T2, T3, T4, T5>)
    & (<T1, T2, T3, T4, T5, T6, R, C: Context, Fn: Fn6<T1, T2, T3, T4, T5, T6, R>>(cfn: [C, Fn], t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6, ...rest: Array<void>) => CpsEffect6<C, Fn, T1, T2, T3, T4, T5, T6>)
    & (<T, R, C: Context, Fn: FnSpread<T, R>>(cfn: [C, Fn], t1: T, t2: T, t3: T, t4: T, t5: T, t6: T, ...args: Array<T>) => CpsEffectSpread<null, Fn, T>);

  declare type CpsFn =
    & ContextCpsFn
    & (<R, Fn: Fn0<R>>(fn: Fn, ...rest: Array<void>) => CpsEffect0<null, Fn>)
    & (<T1, R, Fn: Fn1<T1, R>>(fn: Fn, t1: T1, ...rest: Array<void>) => CpsEffect1<null, Fn, T1>)
    & (<T1, T2, R, Fn: Fn2<T1, T2, R>>(fn: Fn, t1: T1, t2: T2, ...rest: Array<void>) => CpsEffect2<null, Fn, T1, T2>)
    & (<T1, T2, T3, R, Fn: Fn3<T1, T2, T3, R>>(fn: Fn, t1: T1, t2: T2, t3: T3, ...rest: Array<void>) => CpsEffect3<null, Fn, T1, T2, T3>)
    & (<T1, T2, T3, T4, R, Fn: Fn4<T1, T2, T3, T4, R>>(fn: Fn, t1: T1, t2: T2, t3: T3, t4: T4, ...rest: Array<void>) => CpsEffect4<null, Fn, T1, T2, T3, T4>)
    & (<T1, T2, T3, T4, T5, R, Fn: Fn5<T1, T2, T3, T4, T5, R>>(fn: Fn, t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, ...rest: Array<void>) => CpsEffect5<null, Fn, T1, T2, T3, T4, T5>)
    & (<T1, T2, T3, T4, T5, T6, R, Fn: Fn6<T1, T2, T3, T4, T5, T6, R>>(fn: Fn, t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6, ...rest: Array<void>) => CpsEffect6<null, Fn, T1, T2, T3, T4, T5, T6>)
    & (<T, R, Fn: FnSpread<T, R>>(fn: Fn, t1: T, t2: T, t3: T, t4: T, t5: T, t6: T, ...args: Array<T>) => CpsEffectSpread<null, Fn, T>);

  /**
   * SPAWN STUFF
   */
  declare type ContextSpawnFn =
    & (<R, C: Context, Fn: Fn0<R>>(cfn: [C, Fn], ...rest: Array<void>) => SpawnEffect0<C, Fn>)
    & (<T1, R, C: Context, Fn: Fn1<T1, R>>(cfn: [C, Fn], t1: T1, ...rest: Array<void>) => SpawnEffect1<C, Fn, T1>)
    & (<T1, T2, R, C: Context, Fn: Fn2<T1, T2, R>>(cfn: [C, Fn], t1: T1, t2: T2, ...rest: Array<void>) => SpawnEffect2<C, Fn, T1, T2>)
    & (<T1, T2, T3, R, C: Context, Fn: Fn3<T1, T2, T3, R>>(cfn: [C, Fn], t1: T1, t2: T2, t3: T3, ...rest: Array<void>) => SpawnEffect3<C, Fn, T1, T2, T3>)
    & (<T1, T2, T3, T4, R, C: Context, Fn: Fn4<T1, T2, T3, T4, R>>(cfn: [C, Fn], t1: T1, t2: T2, t3: T3, t4: T4, ...rest: Array<void>) => SpawnEffect4<C, Fn, T1, T2, T3, T4>)
    & (<T1, T2, T3, T4, T5, R, C: Context, Fn: Fn5<T1, T2, T3, T4, T5, R>>(cfn: [C, Fn], t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, ...rest: Array<void>) => SpawnEffect5<C, Fn, T1, T2, T3, T4, T5>)
    & (<T1, T2, T3, T4, T5, T6, R, C: Context, Fn: Fn6<T1, T2, T3, T4, T5, T6, R>>(cfn: [C, Fn], t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6, ...rest: Array<void>) => SpawnEffect6<C, Fn, T1, T2, T3, T4, T5, T6>)
    & (<T, R, C: Context, Fn: FnSpread<T, R>>(cfn: [C, Fn], t1: T, t2: T, t3: T, t4: T, t5: T, t6: T, ...args: Array<T>) => SpawnEffectSpread<null, Fn, T>);

  declare type SpawnFn =
    & ContextSpawnFn
    & (<R, Fn: Fn0<R>>(fn: Fn, ...rest: Array<void>) => SpawnEffect0<null, Fn>)
    & (<T1, R, Fn: Fn1<T1, R>>(fn: Fn, t1: T1, ...rest: Array<void>) => SpawnEffect1<null, Fn, T1>)
    & (<T1, T2, R, Fn: Fn2<T1, T2, R>>(fn: Fn, t1: T1, t2: T2, ...rest: Array<void>) => SpawnEffect2<null, Fn, T1, T2>)
    & (<T1, T2, T3, R, Fn: Fn3<T1, T2, T3, R>>(fn: Fn, t1: T1, t2: T2, t3: T3, ...rest: Array<void>) => SpawnEffect3<null, Fn, T1, T2, T3>)
    & (<T1, T2, T3, T4, R, Fn: Fn4<T1, T2, T3, T4, R>>(fn: Fn, t1: T1, t2: T2, t3: T3, t4: T4, ...rest: Array<void>) => SpawnEffect4<null, Fn, T1, T2, T3, T4>)
    & (<T1, T2, T3, T4, T5, R, Fn: Fn5<T1, T2, T3, T4, T5, R>>(fn: Fn, t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, ...rest: Array<void>) => SpawnEffect5<null, Fn, T1, T2, T3, T4, T5>)
    & (<T1, T2, T3, T4, T5, T6, R, Fn: Fn6<T1, T2, T3, T4, T5, T6, R>>(fn: Fn, t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6, ...rest: Array<void>) => SpawnEffect6<null, Fn, T1, T2, T3, T4, T5, T6>)
    & (<T, R, Fn: FnSpread<T, R>>(fn: Fn, t1: T, t2: T, t3: T, t4: T, t5: T, t6: T, ...args: Array<T>) => SpawnEffectSpread<null, Fn, T>);

  declare type IdentityFunction = <T>(a: T) => T;

  /**
   * SELECT STUFF
   */
  declare type SelectFn =
    & (() => SelectEffect0<IdentityFunction>)
    & (<Fn: SelectFn>(selector: Fn, ...rest: Array<void>) => SelectEffect0<Fn>)
    & (<T1, Fn: SelectFn1<T1>>(selector: Fn, t1: T1, ...rest: Array<void>) => SelectEffect1<Fn, T1>)
    & (<T1, T2, Fn: SelectFn2<T1, T2>>(selector: Fn, t1: T1, t2: T2, ...rest: Array<void>) => SelectEffect2<Fn, T1, T2>)
    & (<T1, T2, T3, Fn: SelectFn3<T1, T2, T3>>(selector: Fn, t1: T1, t2: T2, t3: T3, ...rest: Array<void>) => SelectEffect3<Fn, T1, T2, T3>)
    & (<T1, T2, T3, T4, Fn: SelectFn4<T1, T2, T3, T4>>(selector: Fn, t1: T1, t2: T2, t3: T3, t4: T4, ...rest: Array<void>) => SelectEffect4<Fn, T1, T2, T3, T4>)
    & (<T1, T2, T3, T4, T5, Fn: SelectFn5<T1, T2, T3, T4, T5>>(selector: Fn, t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, ...rest: Array<void>) => SelectEffect5<Fn, T1, T2, T3, T4, T5>)
    & (<T1, T2, T3, T4, T5, T6, Fn: SelectFn6<T1, T2, T3, T4, T5, T6>>(selector: Fn, t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6, ...rest: Array<void>) => SelectEffect6<Fn, T1, T2, T3, T4, T5, T6>)
    & (<T, Fn: SelectFnSpread<T>>(selector: Fn, t1: T, t2: T, t3: T, t4: T, t5: T, t6: T, ...rest: Array<T>) => SelectEffectSpread<Fn, T>)

  declare type TakeFn = {
    <P: Pattern>(                  pattern: P): TakeEffect<P>;
    <P: Pattern>(channel: Channel, pattern: P): TakeEffect<P>;
  }

  declare type PutFn = {
    <T: Object>(action: T): PutEffect<T>;
    <T: Object>(channel: Channel, action: T): PutEffect<T>;
  }

  declare type ActionChannelFn = {
    <P: Pattern>(pattern: P, buffer?: Buffer): ActionChannelEffect<P>;
  }

  declare type JoinFn = {
    (task: Task): JoinEffect;
  }

  declare type CancelFn = {
    (task: Task): CancelEffect;
  }

  declare type RaceFn = {
    <T: {[key: string]: IOEffect}>(effects: T): RaceEffect<T>;
  }

  declare type FlushFn = {
    (channel: Channel): FlushEffect;
  }

  import typeof {takeEvery as TakeEveryFn} from 'redux-saga'
  declare var takeEvery: TakeEveryFn;
  declare var takeLatest: TakeEveryFn;

  declare module.exports: {
    take: TakeFn,
    takem: TakeFn,
    put: PutFn,
    race: RaceFn,
    call: CallFn,
    apply: ApplyFn,
    cps: CpsFn,
    fork: ForkFn,
    spawn: SpawnFn,
    join: JoinFn,
    cancel: CancelFn,
    select: SelectFn,
    actionChannel: ActionChannelFn,
    cancelled: () => CancelledEffect,
    flush: FlushFn,
    takeEvery: $FixMe,
    takeLatest: $FixMe
  }
}