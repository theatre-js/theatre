import type {SequenceEditorTree_AllRowTypes} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import type {PropAddress} from '@theatre/shared/utils/addresses'
import {useLayoutEffect} from 'react'
import {whatPropIsHighlighted} from '@theatre/studio/panels/SequenceEditorPanel/whatPropIsHighlighted'

/** This should ignore if  */
export function usePropHighlightMouseEnter(
  node: HTMLElement | null,
  leaf: SequenceEditorTree_AllRowTypes,
) {
  useLayoutEffect(() => {
    if (!node) return
    if (
      leaf.type !== 'propWithChildren' &&
      leaf.type !== 'primitiveProp' &&
      leaf.type !== 'sheetObject'
    )
      return

    let unlock: null | (() => void) = null
    const propAddress: PropAddress = {
      ...leaf.sheetObject.address,
      pathToProp: leaf.type === 'sheetObject' ? [] : leaf.pathToProp,
    }

    function onMouseEnter() {
      unlock = whatPropIsHighlighted.replaceLock(propAddress, () => {
        // cleanup on forced unlock
      })
    }
    function onMouseLeave() {
      unlock?.()
    }

    node.addEventListener('mouseenter', onMouseEnter)
    node.addEventListener('mouseleave', onMouseLeave)

    return () => {
      unlock?.()
      node.removeEventListener('mouseenter', onMouseEnter)
      node.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [node])
}
