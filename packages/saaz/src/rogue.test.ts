import {BackMemoryAdapter} from './back/BackMemoryAdapter'
import SaazBack from './back/SaazBack'
import {FrontMemoryAdapter} from './front/FrontMemoryAdapter'
import {SaazFront} from './front/SaazFront'
import type {Root} from './rogue'
import {change, fromOps, jsonFromCell} from './rogue'
import type { Schema} from './types'

const ahistoricSnapshot: Root = {
  $type: ['map', 'base'],
  $branches: {
    base: {
      $mapProps: {
        foo: {
          $type: ['map', 'base'],
          $branches: {
            base: {
              $boxedValue:
                'some value here, but this will be ignored, because this is an obj register.',
              $mapProps: {
                bar: {
                  $type: ['boxed', 'base'],
                  $branches: {
                    base: {
                      $boxedValue:
                        'some value here. this is an lww register, and it can contain any json value.',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
}

describe(`Rogue`, () => {
  test('setting a non-existing prop', () => {
    const [rep, ops] = change({}, (draft) => {
      expect(draft.a).toBe(undefined)
      draft.a = 1
      expect(draft.a).toBe(1)
    })
    expect(jsonFromCell(rep)).toEqual({a: 1})

    expect([rep, ops]).toMatchSnapshot()
    const [rep2] = fromOps({}, ops)
    expect(rep2).toEqual(rep)
  })
  test('overriding an existing prop with the same value', () => {
    const [rep1] = change({}, (draft) => {
      draft.a = 1
    })
    const [rep2, ops] = change(rep1, (draft) => {
      expect(draft.a).toBe(1)
      draft.a = 1
      expect(draft.a).toBe(1)
    })
    expect(rep1).toBe(rep2)
    expect(ops).toEqual([])
  })
  test('overriding an existing prop', () => {
    const [rep1] = change({}, (draft) => {
      draft.a = 1
    })
    const [rep2, ops] = change(rep1, (draft) => {
      expect(draft.a).toBe(1)
      draft.a = 2
      expect(draft.a).toBe(2)
    })
    expect(jsonFromCell(rep2)).toEqual({a: 2})
    expect(ops).toHaveLength(1)
    expect(ops).toMatchSnapshot()
    const [rep3] = fromOps(rep1, ops)
    expect(rep3).toEqual(rep2)
  })
  test('setting a non-existing prop to an object', () => {
    const [rep, ops] = change({}, (draft) => {
      expect(draft.a).toBe(undefined)
      draft.a = {b: 1}
      expect(draft.a).toEqual(draft.a)
      expect(draft.a).toEqual({b: 1})
    })
    expect(jsonFromCell(rep)).toEqual({a: {b: 1}})

    expect([rep, ops]).toMatchSnapshot()
    const [rep2] = fromOps({}, ops)
    expect(rep2).toEqual(rep)
  })

  test('setting an existing prop to an object', () => {
    const [rep] = change({}, (draft) => {
      draft.a = {b: 1}
    })
    expect(jsonFromCell(rep)).toEqual({a: {b: 1}})
    const [rep2, ops2] = change(rep, (draft) => {
      expect(draft.a).toEqual({b: 1})
      draft.a = {b: 2}
      expect(draft.a).toEqual({b: 2})
    })

    expect(jsonFromCell(rep2)).toEqual({a: {b: 2}})
    const [rep3] = fromOps(rep, ops2)
    expect(rep3).toEqual(rep2)
  })
  test('setting an existing prop from an object', () => {
    const [rep] = change({}, (draft) => {
      draft.a = {b: 1}
    })
    expect(jsonFromCell(rep)).toEqual({a: {b: 1}})
    const [rep2, ops2] = change(rep, (draft) => {
      expect(draft.a).toEqual({b: 1})
      draft.a = {c: 1}
      expect(draft.a).toEqual({c: 1})
    })

    expect(jsonFromCell(rep2)).toEqual({a: {c: 1}})
    const [rep3] = fromOps(rep, ops2)
    expect(rep3).toEqual(rep2)
  })

  test(`merging defaults`, () => {
    const [, ops1_1] = change({}, (draft) => {
      draft.a = {aStep: 1, foo: 'setBy1', obj: {objA: 'true'}}
    })
    const [, ops2_1] = change({}, (draft) => {
      draft.a = {bStep: 1, foo: 'setBy2', obj: {objB: 'true'}}
    })

    const merge1 = fromOps({}, [...ops2_1, ...ops1_1])[0]

    const _11 = jsonFromCell(merge1)
    expect(_11).toMatchSnapshot()
    // console.log(_11)
  })

  function scenario(
    name: string,
    steps: Record<
      string,
      (draft: any, lastSnapshot: any, lastOps: any[]) => void
    >,
  ) {
    describe(name, () => {
      type StepResult = {
        json: any
        ops: any[]
        backwardOps: any[]
        rep: any
        next?: StepResult
        prev?: StepResult
      }
      let last: StepResult = {
        json: {},
        backwardOps: [],
        ops: [],
        rep: {},
      }
      const byStep: Record<string, StepResult> = {}

      for (const [stepName, fn] of Object.entries(steps)) {
        test(stepName, () => {
          const prev: StepResult = {...last}
          const [rep, ops, backwardOps] = change(prev.rep, (draft) => {
            fn(draft, prev.json, prev.ops)
          })
          const stepResult: StepResult = {
            rep,
            ops,
            backwardOps,
            json: jsonFromCell(rep),
            prev,
          }
          last.next = stepResult
          last = stepResult
          byStep[stepName] = stepResult
        })
      }

      // i = 0 so that we skip the first step, which is the initial state
      for (let i = 1; i < Object.keys(steps).length; i++) {
        const prevStepName = Object.keys(steps)[i - 1]
        const stepName = Object.keys(steps)[i]
        test(`${prevStepName} => ${stepName}`, () => {
          const stepResult = byStep[stepName]
          const [rep] = fromOps(stepResult.prev!.rep, stepResult.ops)
          expect(rep).toEqual(stepResult.rep)
        })

        test(`${prevStepName} <= ${stepName}`, () => {
          const stepResult = byStep[stepName]
          const [rep] = fromOps(stepResult.rep, stepResult.backwardOps)
          const s = jsonFromCell(rep)
          // note that as opposed to the previous test, we're not comparing cells, we're
          // comparing snapshots. This is because the cells are not guaranteed to be the
          // same when undoing a change, but the snapshots are.
          expect(s).toEqual(stepResult.prev!.json)
        })
      }
    })
  }

  scenario('scenario 1', {
    step1: (draft) => {
      expect(draft.a).toBe(undefined)
      draft.a = 1
      expect(draft.a).toBe(1)
    },
    step2: (_, snapshot, ops) => {
      expect(snapshot).toEqual({a: 1})
    },
  })
  scenario('scenario 2', {
    step1: (draft) => {
      draft.a = {a1: {a11: 1}}
      expect(draft.a.a1).toEqual({a11: 1})
      draft.a.a1.a11 = 2
      expect(draft.a).toEqual({a1: {a11: 2}})
    },
    step2: (_, snapshot, ops) => {
      expect(snapshot).toEqual({a: {a1: {a11: 2}}})
    },
  })
  scenario('scenario 3', {
    step1: (draft) => {
      draft.a = {a1: {a11: 1}}
      expect(draft.a.a1).toEqual({a11: 1})
      draft.a = {b: 1}
      expect(draft.a).toEqual({b: 1})
    },
    step2: (draft, snapshot, ops) => {
      expect(draft.a).toEqual({b: 1})
      draft.a = 1
    },
    step3: (draft, snapshot) => {
      expect(snapshot).toEqual({a: 1})
    },
  })
  describe(`saaz integration`, () => {
    test(`test`, async () => {
      type State = {
        $schemaVersion: number
        count: number
      }

      const schema: Schema<State> = {
        version: 1,
        // migrateOp(state: $IntentionalAny) {},
        // migrateCell(s) {},
        generators: {},
        editors: {
          increaseBy(state: State, generators: {}, opts: {by: number}) {
            state.count += opts.by
          },
        },
        opShape: null as any as State,
        cellShape: null as any as {},
      }
      const backend = new SaazBack({
        schema,
        dbName: 'test',
        storageAdapter: new BackMemoryAdapter(),
      })
      const saaz = new SaazFront({
        schema,
        dbName: 'test',
        peerId: '1',
        storageAdapter: new FrontMemoryAdapter(),
        backend,
      })

      saaz.tx((editors) => {})

      saaz.teardown()
    })
  })
})
