import * as GeneratorSpy from './GeneratorSpy'
import type {Draft} from 'immer'
import {createDraft, finishDraft} from 'immer'
import {get} from 'lodash-es'
import type {
  $FixMe,
  EditorDefinitionToEditorInvocable,
  Invokations,
  Transaction,
  EditorDefinitionFn,
  $IntentionalAny,
  EditorDefinitions,
  Schema,
  ValidOpSnapshot as ValidOpSnapshot,
  ValidGenerators,
  GeneratorRecordings,
  FullSnapshot,
} from '../types'
import {fromOps} from '../rogue'

export function applyOptimisticUpdateToState<
  OpSnapshot extends ValidOpSnapshot,
>(
  {
    invokations,
    generatorRecordings,
    draftOps,
  }: Pick<Transaction, 'invokations' | 'generatorRecordings' | 'draftOps'>,
  before: FullSnapshot<OpSnapshot>,
  schema: Schema<OpSnapshot>,
  playbackOnly: boolean = false,
  testDeterminism: boolean = true,
): [after: FullSnapshot<OpSnapshot>, generatorRecordings: GeneratorRecordings] {
  const draft = createDraft(before.op)
  const [generatorSpy, newRecordings] = GeneratorSpy.createGeneratorsSpy(
    schema.generators,
    generatorRecordings,
    playbackOnly,
  )

  runInvokations(schema, draft, invokations, generatorSpy)
  const opSnapshotAfter = finishDraft(draft) as $FixMe as OpSnapshot
  const [cellAfter] = fromOps(before.cell, draftOps)
  return [{op: opSnapshotAfter, cell: cellAfter}, newRecordings]
}

export function recordInvokations<Editors extends {}, Lorenzo extends {}>(
  editors: Editors,
  fn: (editors: EditorDefinitionToEditorInvocable<Editors>) => void,
): Invokations {
  const {invokableEditors, release, invokations} =
    invokables.getInvokables(editors)
  let released = false
  try {
    fn(invokableEditors)
    release()
    released = true
  } catch (error) {
    throw error
  } finally {
    if (!released) {
      release()
    }
  }
  return invokations
}

function runInvokations<Snapshot extends ValidOpSnapshot>(
  schema: Schema<Snapshot>,
  prevState: Draft<Snapshot>,
  invokations: Invokations,
  generatorSpy: ValidGenerators,
): void {
  for (const [fnPath, opts] of invokations) {
    const fn = get(schema.editors, fnPath.split('.')) as EditorDefinitionFn
    if (typeof fn !== 'function') {
      throw new Error(
        `editor ${fnPath} not found. Transaction may be corrupt, or the editor names may have changed`,
      )
    }
    fn(prevState, generatorSpy, opts)
  }
}
namespace invokables {
  class Pool<PoolItem> {
    private _items: PoolItem[] = []
    constructor(readonly _factory: () => PoolItem) {}

    /**
     * Get an item from the pool. If the pool is empty, a new item is created. Also starts a timer to ensure that the item is released back into the pool.
     *
     * @returns A tuple of the item and a function to release the item back into the pool.
     *
     */
    get(releaseTimeoutms: number = 0): [PoolItem, () => void] {
      const item =
        this._items.length === 0 ? this._factory() : this._items.pop()!
      let released = false

      // if the invokables are not released within 0ms, it's probably a bug + memory leak.
      const releaseTimeout = setTimeout(() => {
        if (!released) {
          throw new Error('Release timeout exceeded.')
        }
      }, releaseTimeoutms)

      const release = () => {
        released = true
        clearTimeout(releaseTimeout)
        this._items.push(item)
      }

      return [item, release]
    }
  }

  type InvokationContext = {
    snapshot: Draft<{}>
    invokations: Invokations
  }

  type PoolItem = {
    context: InvokationContext
    invokableEditors: EditorDefinitionToEditorInvocable<$IntentionalAny>
  }
  const pools = new WeakMap<{}, Pool<PoolItem>>()

  function getPool(editorDefinition: {}): Pool<PoolItem> {
    if (!pools.has(editorDefinition)) {
      function createPoolItem<Editors extends EditorDefinitions>(
        editors: Editors,
      ): PoolItem {
        const context = {
          snapshot: {},
          invokations: [],
        }
        const invokableEditors = createInvokables(editors, context)

        return {context, invokableEditors}
      }

      const pool = new Pool(() => createPoolItem(editorDefinition))
      pools.set(editorDefinition, pool)
      return pool
    } else {
      return pools.get(editorDefinition)!
    }
  }

  function createInvokables<Editors extends EditorDefinitions>(
    editors: Editors,
    context: InvokationContext,
    pathSoFar: string[] = [],
  ): EditorDefinitionToEditorInvocable<Editors> {
    const cache: $IntentionalAny = {}

    const proxy = new Proxy(new Function(), {
      get(_, prop: string) {
        if (prop in cache) {
          return cache[prop]
        } else if (!(prop in editors)) {
          const path = [...pathSoFar, prop]
          throw new Error(`editor "${path.join('.')}" not found`)
        } else {
          const path = [...pathSoFar, prop]
          const sub = createInvokables(
            (editors as $IntentionalAny)[prop],
            context,
            path,
          )
          cache[prop] = sub
          return sub
        }
      },
      apply(_, __, args: [$IntentionalAny]) {
        const opts = args[0]
        if (typeof editors !== 'function') {
          throw new Error(`editor "${pathSoFar.join('.')}" is not a function`)
        } else {
          context.invokations.push([pathSoFar.join('.'), opts])
        }
      },
    })

    return proxy as $IntentionalAny
  }

  export function getInvokables<Defs extends EditorDefinitions>(
    editorDefinitions: Defs,
  ): {
    invokableEditors: EditorDefinitionToEditorInvocable<Defs>
    release: () => void
    invokations: Invokations
  } {
    const pool = getPool(editorDefinitions)
    const [poolItem, release] = pool.get()

    const {context, invokableEditors} = poolItem

    context.invokations = []

    return {
      invokableEditors: invokableEditors as $IntentionalAny,
      release,
      invokations: context.invokations,
    }
  }
}
