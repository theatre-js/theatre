import {SaazFront} from './front/SaazFront'
import {FrontMemoryAdapter} from './front/FrontMemoryAdapter'
import SaazBack from './back/SaazBack'
import type {$IntentionalAny, Schema} from './types'
import {BackMemoryAdapter} from './back/BackMemoryAdapter'

jest.setTimeout(1000)

describe(`saaz`, () => {
  test('everything', async () => {
    type OpShape = {
      $schemaVersion: number
      opCount: number
    }

    type Generators = {
      rand: () => number
    }

    let randNum = 10

    const generators: Generators = {
      rand: () => {
        return randNum++
      },
    }

    const opEditors = {
      increaseBy(state: OpShape, generators: Generators, opts: {by: number}) {
        let count = state.opCount ?? 0
        state.opCount = count + opts.by
      },

      // this is a bad editor because it uses a random number generator, so it's not deterministic.
      // we expect saaz.tx() to throw an error if we try to use it.
      randomizeCountBadly(state: OpShape, generators: Generators, opts: {}) {
        state.opCount = Math.random()
      },

      // this is a good editor because it uses a random number generator, but it's deterministic.
      randomizeCountWell(state: OpShape, generators: Generators, opts: {}) {
        state.opCount = generators.rand()
      },
    }

    type CellShape = {cellCount?: number}

    const schema: Schema<
      OpShape,
      typeof opEditors,
      typeof generators,
      CellShape
    > = {
      opShape: null as $IntentionalAny as OpShape,
      // migrateOp(state: $IntentionalAny) {},
      // migrateCell(s) {},

      version: 1,
      editors: opEditors,
      generators: generators,
      cellShape: null as any as CellShape,
    } as const

    const mem = new FrontMemoryAdapter()

    const backend = new SaazBack({
      storageAdapter: new BackMemoryAdapter(),
      dbName: 'test',
      schema,
    })

    const saaz = new SaazFront({
      schema,
      backend,
      peerId: '1',
      storageAdapter: mem,
      dbName: 'test',
    })

    await saaz.ready

    expect(saaz.state.op.opCount).toEqual(undefined)
    expect(saaz.state.cell.cellCount).toEqual(undefined)

    expect(() =>
      saaz.tx((editors) => {
        editors.randomizeCountBadly({})
      }),
    ).toThrow()

    expect(() =>
      saaz.tx(undefined, (draft) => {
        draft.cellCount = 1
        throw new Error('oops')
      }),
    ).toThrow()

    expect(saaz.state.op.opCount).toEqual(undefined)
    expect(saaz.state.cell.cellCount).toEqual(undefined)

    expect(() =>
      saaz.tx((editors) => {
        editors.increaseBy({by: 1})
        throw new Error('oops')
      }),
    ).toThrow()

    expect(saaz.state.op.opCount).toEqual(undefined)

    expect(() =>
      saaz.tx((editors) => {
        editors.randomizeCountWell({})
      }),
    ).not.toThrow()

    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(saaz.state.op.opCount).toEqual(10)

    saaz.tx(undefined, (draft) => {
      draft.cellCount = 1
    })

    expect(saaz.state.cell.cellCount).toEqual(1)

    saaz.tx((editors) => {
      editors.increaseBy({by: 3})
    })

    expect(saaz.state.op.opCount).toEqual(13)

    await saaz.waitForBackendSync()

    await saaz.waitForStorageSync()

    expect(
      (mem.export() as $IntentionalAny).keyval['test/lastBackendState'].value
        .op,
    ).toEqual({opCount: 13})

    // const fauxBackennd: SaazBackInterface = {
    //   async getUpdatesSinceClock() {
    //     return {clock: null, hasUpdates: false}
    //   },
    //   applyUpdates(opts) {
    //     return Promise.resolve({ok: true, hasUpdates: false})
    //   },
    //   updatePresence(opts) {
    //     return Promise.resolve({ok: true})
    //   },
    //   async subscribe() {
    //     return () => {}
    //   },
    // }

    const saaz2 = new SaazFront({
      schema,
      peerId: '2',
      storageAdapter: new FrontMemoryAdapter(),
      dbName: 'test',
      backend: backend,
    })

    await saaz2.ready
    await saaz2.waitForBackendSync()
    expect(saaz2.state).toEqual(saaz.state)

    const saaz3 = new SaazFront({
      schema,
      peerId: '3',
      storageAdapter: new FrontMemoryAdapter(),
      dbName: 'test',
      backend: backend,
    })

    await saaz3.ready
    await saaz3.waitForBackendSync()

    expect(saaz3.state).toEqual(saaz.state)

    saaz.tx(undefined, (draft) => {
      draft.cellCount = 2
    })

    expect(saaz.state.cell.cellCount).toEqual(2)

    saaz.tx(undefined, (draft) => {
      draft.cellCount = 3
    })

    expect(saaz.state.cell.cellCount).toEqual(3)

    await saaz.waitForBackendSync()
    await saaz3.waitForBackendSync()

    expect(saaz3.state).toEqual(saaz.state)

    saaz.undo()

    expect(saaz.state.cell.cellCount).toEqual(2)

    await saaz.waitForBackendSync()
    await saaz3.waitForBackendSync()

    expect(saaz3.state).toEqual(saaz.state)

    saaz.undo()

    expect(saaz.state.cell.cellCount).toEqual(1)

    saaz.redo()
    expect(saaz.state.cell.cellCount).toEqual(2)

    saaz.redo()
    expect(saaz.state.cell.cellCount).toEqual(3)

    saaz.undo()
    saaz.undo()
    expect(saaz.state.cell.cellCount).toEqual(1)

    saaz.tx(undefined, (draft) => {
      draft.cellCount = 4
    })

    expect(saaz.state.cell.cellCount).toEqual(4)
    saaz.redo()
    expect(saaz.state.cell.cellCount).toEqual(4)
    saaz.undo()
    expect(saaz.state.cell.cellCount).toEqual(1)

    saaz.teardown()
    saaz2.teardown()
    saaz3.teardown()
  })
})
