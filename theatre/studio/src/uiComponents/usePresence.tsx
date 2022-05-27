import type {StudioSheetItemKey} from '@theatre/shared/utils/ids'
import type {StrictRecord} from '@theatre/shared/utils/types'
import React, {useMemo} from 'react'
import {useEffect} from 'react'
import {useLogger} from './useLogger'
import {Box, prism, valueDerivation} from '@theatre/dataverse'
import {Atom} from '@theatre/dataverse'
import {useVal} from '@theatre/react'

export enum FocusRelationship {
  /** The related parent */
  Hovered,
  /** The related parent */
  Parent,
  /** The related child / moves with */
  Child,
  /** The object containing the hovered item */
  ParentObject,
}

function createPresence(): Presence {
  const currentPresence = new Box<StudioSheetItemKey | undefined>(undefined)
  // TODO: move into ephemeral
  const atom = new Atom({} as StrictRecord<StudioSheetItemKey, boolean>)

  type FocusRelationshipWithImportance = {
    importance: number
    relationship: FocusRelationship
  }

  // keep as part of presence creation
  const relations = new Atom(
    {} as StrictRecord<
      StudioSheetItemKey,
      StrictRecord<
        StudioSheetItemKey,
        StrictRecord<string, FocusRelationshipWithImportance>
      >
    >,
  )

  let lastRelationId = 0

  return {
    addRelationships(itemKey, relationships) {
      const relId = String(++lastRelationId)
      const undoAtPaths = relationships.map((rel) => {
        const focusRel: FocusRelationshipWithImportance = {
          importance: rel.importance ?? 0,
          relationship: rel.relationship,
        }
        const path = [rel.affects, itemKey, relId]
        relations.setIn(path, focusRel)
        return path
      })
      return () => {
        for (const pathToUndo of undoAtPaths) {
          relations.setIn(pathToUndo, undefined)
        }
      }
    },
    useFocused(itemKey) {
      const focusD = useMemo(() => {
        if (!itemKey) return
        const currentD = currentPresence.derivation
        const primaryFocusDer = valueDerivation(atom.pointer[itemKey])
        const relationsDer = valueDerivation(relations.pointer[itemKey])
        return prism(() => {
          const primary = primaryFocusDer.getValue()
          if (primary) {
            return FocusRelationship.Hovered
          } else {
            const related = relationsDer.getValue()
            const current = currentD.getValue()
            const rels = related && current && related[current]
            if (rels) {
              // can this be cached into a derived atom?
              let best: FocusRelationshipWithImportance | undefined
              for (const rel of Object.values(rels)) {
                if (!rel) continue
                if (best && best.importance >= rel.importance) continue
                best = rel
              }
              return best?.relationship
            }
            return undefined
          }
        })
      }, [itemKey])
      return useVal(focusD)
    },
    setUserHover(itemKeyOpt) {
      const prev = currentPresence.get()
      if (prev === itemKeyOpt) {
        return
      }
      if (prev) {
        atom.setIn([prev], false)
      }
      currentPresence.set(itemKeyOpt)
      if (itemKeyOpt) {
        atom.setIn([itemKeyOpt], true)
      }
    },
  }
}

type RelationshipConfig = {
  affects: StudioSheetItemKey
  relationship: FocusRelationship
  importance?: number
}

type Presence = {
  useFocused(
    itemKey: StudioSheetItemKey | undefined,
  ): FocusRelationship | undefined
  setUserHover(itemKey: StudioSheetItemKey | undefined): void
  /**  */
  addRelationships(
    itemKey: StudioSheetItemKey,
    config: Array<RelationshipConfig>,
  ): () => void
}

const presenceCtx = React.createContext<Presence>(createPresence())
export function ProvidePresenceRoot({
  presence = createPresence(),
  children,
}: React.PropsWithChildren<{presence?: Presence}>) {
  return React.createElement(
    presenceCtx.Provider,
    {children, value: presence},
    children,
  )
}

const PRESENCE_ITEM_DATA_ATTR = 'data-pi'
// const PRESENCE_ITEM_DEBUG_DATA_ATTR = 'data-pi-loc'

export default function usePresence(config: {
  key: StudioSheetItemKey | undefined
}): [
  props: {[attr: `data-${string}`]: string},
  focus: {
    current: FocusRelationship | undefined
    useRelationships(
      getRelationships: () => Array<RelationshipConfig>,
      // QUESTION: is this right?
      deps: any[],
    ): void
  },
] {
  const presence = React.useContext(presenceCtx)
  const focus = presence.useFocused(config.key)

  return [
    {
      [PRESENCE_ITEM_DATA_ATTR]: config.key as string,
      // [PRESENCE_ITEM_DEBUG_DATA_ATTR]: config.areaDebugName,
    },
    {
      current: focus,
      useRelationships(getRelationships, deps) {
        useEffect(() => {
          console.log('deps', deps.length, ...deps)
          return (
            config.key &&
            presence.addRelationships(config.key, getRelationships())
          )
        }, [config.key, ...deps])
      },
    },
  ]
}

export function usePresenceListeners(target: HTMLElement | null | undefined) {
  const presence = React.useContext(presenceCtx)
  const logger = useLogger('PresenceListeners')
  useEffect(() => {
    let cleanup: (() => void) | undefined = undefined
    let last: any
    if (!target) return
    const onMouseOver = (event: MouseEvent) => {
      if (event.target instanceof Node) {
        const found = closest(event.target, `[${PRESENCE_ITEM_DATA_ATTR}]`)
        if (found) {
          const itemKey = found.getAttribute(PRESENCE_ITEM_DATA_ATTR)
          if (last !== itemKey) {
            last = itemKey
            presence.setUserHover(itemKey as StudioSheetItemKey | undefined)
            logger._debug('Updated current hover', {itemKey})
          }
          return
        }

        // remove hover
        if (last != null) {
          last = null
          presence.setUserHover(undefined)
          logger._debug('Cleared current hover')
        }
      }
    }

    target.addEventListener('mouseover', onMouseOver)

    return () => {
      cleanup?.()
      target.removeEventListener('mouseover', onMouseOver)
      // remove hover
      if (last != null) {
        last = null
        logger._debug('Cleared current hover as part of cleanup')
      }
    }
  }, [target, presence])
}

/**
 * Traverse upwards from the current element to find the first element that matches the selector.
 */
function closest(
  start: Element | Node | null,
  selector: string,
): Element | null {
  if (start == null) return null
  if (start instanceof Element && start.matches(selector)) {
    return start
  } else {
    return closest(start.parentElement, selector)
  }
}
