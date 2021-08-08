import {prism, val} from '@theatre/dataverse'
import {emptyArray} from '@theatre/shared/utils'
import SimpleCache from '@theatre/shared/utils/SimpleCache'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import type {Studio} from './Studio'
import type {PaneInstance} from './TheatreStudio'

export default class PaneManager {
  private readonly _cache = new SimpleCache()

  constructor(private readonly _studio: Studio) {
    this._instantiatePanesAsTheyComeIn()
  }

  private _instantiatePanesAsTheyComeIn() {
    const allPanesD = this._getAllPanes()
    allPanesD.changesWithoutValues().tap(() => {
      allPanesD.getValue()
    })
  }

  private _getAllPanes() {
    return this._cache.get('_getAllPanels()', () =>
      prism((): {[instanceId in string]?: PaneInstance<string>} => {
        const core = val(this._studio.coreP)
        if (!core) return {}
        const instanceDescriptors = val(
          this._studio.atomP.historic.panelInstanceDesceriptors,
        )
        const paneClasses = val(
          this._studio.atomP.ephemeral.extensions.paneClasses,
        )

        const instances: {[instanceId in string]?: PaneInstance<string>} = {}
        for (const [, instanceDescriptor] of Object.entries(
          instanceDescriptors,
        )) {
          const panelClass = paneClasses[instanceDescriptor!.paneClass]
          if (!panelClass) continue
          const {instanceId} = instanceDescriptor!
          const {extensionId, classDefinition: definition} = panelClass

          const instance = prism.memo(
            `instance-${instanceDescriptor!.instanceId}`,
            () => {
              const inst: PaneInstance<$IntentionalAny> = {
                extensionId,
                instanceId,
                definition,
              }
              return inst
            },
            emptyArray,
          )

          instances[instanceId] = instance
        }
        return instances
      }),
    )
  }

  get allPanesD() {
    return this._getAllPanes()
  }

  getPanesOfType<PaneClass extends string>(
    paneClass: PaneClass,
  ): PaneInstance<PaneClass>[] {
    return []
  }

  createPane<PaneClass extends string>(
    paneClass: PaneClass,
  ): PaneInstance<PaneClass> {
    const core = this._studio.core
    if (!core) {
      throw new Error(
        `Can't create a pane because @theatre/core is not yet loaded`,
      )
    }

    const extensionId = val(
      this._studio.atomP.ephemeral.extensions.paneClasses[paneClass]
        .extensionId,
    )

    const allPaneInstances = val(
      this._studio.atomP.historic.panelInstanceDesceriptors,
    )
    let instanceId!: string
    for (let i = 1; i < 1000; i++) {
      instanceId = `${paneClass} #${i}`
      if (!allPaneInstances[instanceId]) break
    }

    if (!extensionId) {
      throw new Error(`Pance class "${paneClass}" is not registered.`)
    }

    this._studio.transaction(({drafts}) => {
      drafts.historic.panelInstanceDesceriptors[instanceId] = {
        instanceId,
        paneClass,
      }
    })

    return this._getAllPanes().getValue()[instanceId]!
  }

  destroyPane(instanceId: string): void {
    const core = this._studio.core
    if (!core) {
      throw new Error(
        `Can't do this yet because @theatre/core is not yet loaded`,
      )
    }

    this._studio.transaction(({drafts}) => {
      delete drafts.historic.panelInstanceDesceriptors[instanceId]
    })
  }
}
