import type {StudioSheetItemKey} from '@theatre/shared/utils/ids'
import type {StrictRecord} from '@theatre/shared/utils/types'
import React, {useMemo} from 'react'
import {useEffect} from 'react'
import {useLogger} from './useLogger'
import {prism, pointerToPrism} from '@theatre/dataverse'
import {Atom} from '@theatre/dataverse'
import {usePrismInstance} from '@theatre/react'
import {selectClosestHTMLAncestor} from '@theatre/studio/utils/selectClosestHTMLAncestor'
import pointerDeep from '@theatre/shared/utils/pointerDeep'

/** To mean the presence value */
export enum PresenceFlag {
  /** Self is hovered or what represents "self" is being hovered */
  Primary = 2,
  /** Related item is hovered */
  Secondary = 1,
  // /** Tutorial */
  // TutorialEmphasis = 0,
}

const undefinedD = prism(() => undefined)
undefinedD.keepHot() // constant anyway...

function createPresenceContext(options: {
  enabled: boolean
}): InternalPresenceContext {
  const currentUserHoverItemB = new Atom<StudioSheetItemKey | undefined>(
    undefined,
  )
  const currentUserHoverFlagItemsAtom = new Atom(
    {} as StrictRecord<StudioSheetItemKey, boolean>,
  )

  // keep as part of presence creation
  const relationsAtom = new Atom(
    {} as StrictRecord<
      StudioSheetItemKey,
      StrictRecord<
        StudioSheetItemKey,
        StrictRecord<string, {flag: PresenceFlag}>
      >
    >,
  )

  let lastRelationId = 0

  return {
    addRelatedFlags(itemKey, relationships) {
      const relationId = String(++lastRelationId)
      // "clean up" paths returned from relationships declared
      const undoAtPaths = relationships.map((rel) => {
        const presence: {flag: PresenceFlag} = {
          flag: rel.flag,
        }
        const path = [rel.affects, itemKey, relationId]
        relationsAtom.setByPointer((p) => pointerDeep(p, path), presence)
        return path
      })
      return () => {
        for (const pathToUndo of undoAtPaths) {
          relationsAtom.setByPointer(
            (p) => pointerDeep(p, pathToUndo),
            undefined,
          )
        }
      }
    },
    usePresenceFlag(itemKey) {
      if (!options.enabled) return undefined

      const focusD = useMemo(() => {
        if (!itemKey) return undefinedD
        // this is the thing being hovered
        const currentD = currentUserHoverItemB.prism
        const primaryFocusDer = pointerToPrism(
          currentUserHoverFlagItemsAtom.pointer[itemKey],
        )
        const relationsDer = pointerToPrism(relationsAtom.pointer[itemKey])
        return prism(() => {
          const primary = primaryFocusDer.getValue()
          if (primary) {
            return PresenceFlag.Primary
          } else {
            const related = relationsDer.getValue()
            const current = currentD.getValue()
            const rels = related && current && related[current]
            if (rels) {
              // can this be cached into a derived atom?
              let best: PresenceFlag | undefined
              for (const rel of Object.values(rels)) {
                if (!rel) continue
                if (best && best >= rel.flag) continue
                best = rel.flag
              }
              return best
            }
            return undefined
          }
        })
      }, [itemKey])
      return usePrismInstance(focusD)
    },
    setUserHover(itemKeyOpt) {
      const prev = currentUserHoverItemB.get()
      if (prev === itemKeyOpt) {
        return
      }
      if (prev) {
        currentUserHoverFlagItemsAtom.setByPointer((p) => p[prev], false)
      }
      currentUserHoverItemB.set(itemKeyOpt)
      if (itemKeyOpt) {
        currentUserHoverFlagItemsAtom.setByPointer((p) => p[itemKeyOpt], true)
      }
    },
  }
}

type FlagRelationConfig = {
  affects: StudioSheetItemKey
  /** adds this flag to affects */
  flag: PresenceFlag
}

type InternalPresenceContext = {
  usePresenceFlag(
    itemKey: StudioSheetItemKey | undefined,
  ): PresenceFlag | undefined
  setUserHover(itemKey: StudioSheetItemKey | undefined): void
  addRelatedFlags(
    itemKey: StudioSheetItemKey,
    config: Array<FlagRelationConfig>,
  ): () => void
}

const presenceInternalCtx = React.createContext<InternalPresenceContext>(
  createPresenceContext({enabled: false}),
)
export function ProvidePresenceRoot({children}: React.PropsWithChildren<{}>) {
  const presence = useMemo(() => createPresenceContext({enabled: false}), [])
  return React.createElement(
    presenceInternalCtx.Provider,
    {children, value: presence},
    children,
  )
}

const PRESENCE_ITEM_DATA_ATTR = 'data-pi-key'

export default function usePresence(key: StudioSheetItemKey | undefined): {
  attrs: {[attr: `data-${string}`]: string}
  flag: PresenceFlag | undefined
  useRelations(getRelations: () => Array<FlagRelationConfig>, deps: any[]): void
} {
  const presenceInternal = React.useContext(presenceInternalCtx)
  const flag = presenceInternal.usePresenceFlag(key)

  return {
    attrs: {
      [PRESENCE_ITEM_DATA_ATTR]: key as string,
    },
    flag,
    useRelations(getRelations, deps) {
      useEffect(() => {
        return key && presenceInternal.addRelatedFlags(key, getRelations())
      }, [key, ...deps])
    },
  }
}

export function usePresenceListenersOnRootElement(
  target: HTMLElement | null | undefined,
) {
  const presence = React.useContext(presenceInternalCtx)
  const logger = useLogger('PresenceListeners')
  useEffect(() => {
    // keep track of current primary hover to make sure we make changes to presence distinct
    let currentItemKeyUserHover: any
    if (!target) return
    const onMouseOver = (event: MouseEvent) => {
      if (event.target instanceof Node) {
        const found = selectClosestHTMLAncestor(
          event.target,
          `[${PRESENCE_ITEM_DATA_ATTR}]`,
        )
        if (found) {
          const itemKey = found.getAttribute(PRESENCE_ITEM_DATA_ATTR)
          if (currentItemKeyUserHover !== itemKey) {
            currentItemKeyUserHover = itemKey
            presence.setUserHover(
              (itemKey || undefined) as StudioSheetItemKey | undefined,
            )
            logger._debug('Updated current hover', {itemKey})
          }
          return
        }

        // remove hover
        if (currentItemKeyUserHover != null) {
          currentItemKeyUserHover = null
          presence.setUserHover(undefined)
          logger._debug('Cleared current hover')
        }
      }
    }

    target.addEventListener('mouseover', onMouseOver)

    return () => {
      target.removeEventListener('mouseover', onMouseOver)
      // remove hover
      if (currentItemKeyUserHover != null) {
        currentItemKeyUserHover = null
        logger._debug('Cleared current hover as part of cleanup')
      }
    }
  }, [target, presence])
}
