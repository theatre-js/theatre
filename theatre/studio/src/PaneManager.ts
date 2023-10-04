import {prism, val} from '@theatre/dataverse'
import SimpleCache from '@theatre/utils/SimpleCache'
import type {$IntentionalAny, StrictRecord} from '@theatre/utils/types'
import type {Studio} from './Studio'
import type {PaneInstance} from './TheatreStudio'
import type {PaneInstanceId} from '@theatre/sync-server/state/types'
import {emptyObject} from '@theatre/shared/utils'

export default class PaneManager {
  private readonly _cache = new SimpleCache()

  constructor(private readonly _studio: Studio) {
    this._instantiatePanesAsTheyComeIn()
  }

  private _instantiatePanesAsTheyComeIn() {
    const allPanesD = this._getAllPanes()
    allPanesD.onStale(() => {
      allPanesD.getValue()
    })
  }

  private _getAllPanes() {
    return this._cache.get('_getAllPanels()', () =>
      prism((): StrictRecord<PaneInstanceId, PaneInstance<string>> => {
        const core = val(this._studio.coreP)
        if (!core) return {}
        const instanceDescriptors =
          val(this._studio.atomP.historic.panelInstanceDesceriptors)! ??
          emptyObject
        const paneClasses =
          val(this._studio.ephemeralAtom.pointer.extensions.paneClasses) ??
          emptyObject

        const instances: StrictRecord<PaneInstanceId, PaneInstance<string>> = {}
        for (const instanceDescriptor of Object.values(instanceDescriptors)) {
          if (!instanceDescriptor) continue
          const panelClass = paneClasses[instanceDescriptor.paneClass]
          if (!panelClass) continue
          const {instanceId} = instanceDescriptor
          const {extensionId, classDefinition: definition} = panelClass

          const instance = prism.memo(
            `instance-${instanceDescriptor.instanceId}`,
            () => {
              const inst: PaneInstance<$IntentionalAny> = {
                extensionId,
                instanceId,
                definition,
              }
              return inst
            },
            [definition],
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
      this._studio.ephemeralAtom.pointer.extensions.paneClasses[paneClass]
        .extensionId,
    )

    const allPaneInstances =
      val(this._studio.atomP.historic.panelInstanceDesceriptors)! ?? emptyObject
    let instanceId!: PaneInstanceId
    for (let i = 1; i < 1000; i++) {
      instanceId = `${paneClass} #${i}` as PaneInstanceId
      if (!allPaneInstances[instanceId]) break
    }

    if (!extensionId) {
      throw new Error(`Pane class "${paneClass}" is not registered.`)
    }

    this._studio.transaction(({stateEditors}) => {
      stateEditors.studio.historic.panelInstanceDescriptors.setDescriptor({
        instanceId,
        paneClass,
      })
    })

    return this._getAllPanes().getValue()[instanceId]!
  }

  destroyPane(instanceId: PaneInstanceId): void {
    const core = this._studio.core
    if (!core) {
      throw new Error(
        `Can't do this yet because @theatre/core is not yet loaded`,
      )
    }

    this._studio.transaction(({stateEditors}) => {
      stateEditors.studio.historic.panelInstanceDescriptors.remove({instanceId})
    })
  }
}
