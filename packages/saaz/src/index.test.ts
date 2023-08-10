import {SaazFront} from './front/SaazFront'
import {FrontMemoryAdapter} from './front/FrontMemoryAdapter'
import SaazBack from './back/SaazBack'
import type {$IntentionalAny} from './types'
import {BackMemoryAdapter} from './back/BackMemoryAdapter'

jest.setTimeout(1000)

describe(`saaz`, () => {
  test('everything', async () => {
    type Snapshot = {
      $schemaVersion: number
      count: number
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

    const editors = {
      increaseBy(state: Snapshot, generators: Generators, opts: {by: number}) {
        state.count += opts.by
      },

      // this is a bad editor because it uses a random number generator, so it's not deterministic.
      // we expect saaz.tx() to throw an error if we try to use it.
      randomizeCountBadly(state: Snapshot, generators: Generators, opts: {}) {
        state.count = Math.random()
      },

      // this is a good editor because it uses a random number generator, but it's deterministic.
      randomizeCountWell(state: Snapshot, generators: Generators, opts: {}) {
        state.count = generators.rand()
      },
    }

    const schema = {
      shape: null as $IntentionalAny as Snapshot,
      migrate(state: $IntentionalAny) {
        state.count ??= 0
      },
      version: 1,
      editors,
      generators: generators,
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

    expect(saaz.state.count).toEqual(0)

    expect(() =>
      saaz.tx((editors) => {
        editors.randomizeCountBadly({})
      }),
    ).toThrow()

    expect(saaz.state.count).toEqual(0)

    expect(() =>
      saaz.tx((editors) => {
        editors.increaseBy({by: 1})
        throw new Error('oops')
      }),
    ).toThrow()

    expect(saaz.state.count).toEqual(0)

    expect(() =>
      saaz.tx((editors) => {
        editors.randomizeCountWell({})
      }),
    ).not.toThrow()

    expect(saaz.state.count).toEqual(10)

    saaz.tx((editors) => {
      editors.increaseBy({by: 3})
    })

    expect(saaz.state.count).toEqual(13)

    await saaz.waitForBackendSync()

    // await new Promise((resolve) => setTimeout(resolve, 100))

    await saaz.waitForStorageSync()

    expect(
      (mem.export() as $IntentionalAny).keyval['test/lastBackendState'].value,
    ).toEqual({count: 13})

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

    // const s = saaz.scrub()
    // s.capture((editors) => {
    //   editors.foo({by: 1})
    // })

    // expect(saaz.state.count).toEqual(1)

    // s.reset()
    // expect(saaz.state.count).toEqual(0)
    // s.capture((editors) => {
    //   editors.foo({by: 1})
    // })
    // expect(saaz.state.count).toEqual(1)
    // s.commit()
    // expect(saaz.state.count).toEqual(1)

    // saaz.undo()
    // expect(saaz.state.count).toEqual(0)

    // saaz.redo()
    // expect(saaz.state.count).toEqual(0)
  })
})
