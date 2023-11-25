import {usePrism, useVal} from '@theatre/react'
import getStudio from '@theatre/studio/getStudio'
import React, {useMemo, useRef} from 'react'
import useTooltip from '@theatre/studio/uiComponents/Popover/useTooltip'
import ErrorTooltip from '@theatre/studio/uiComponents/Popover/ErrorTooltip'
import BasicTooltip from '@theatre/studio/uiComponents/Popover/BasicTooltip'
import {val} from '@theatre/dataverse'
import usePopover from '@theatre/studio/uiComponents/Popover/usePopover'
import MoreMenu from './MoreMenu/MoreMenu'

let showedVisualTestingWarning = false

export function useOutlineTriggerTooltip(
  conflicts: ReturnType<typeof uesConflicts>,
) {
  return useTooltip(
    {enabled: conflicts.length > 0, enterDelay: conflicts.length > 0 ? 0 : 200},
    () =>
      conflicts.length > 0 ? (
        <ErrorTooltip>
          {conflicts.length === 1
            ? `There is a state conflict in project "${conflicts[0].projectId}". Select the project in the outline below in order to fix it.`
            : `There are ${conflicts.length} projects that have state conflicts. They are highlighted in the outline below. `}
        </ErrorTooltip>
      ) : (
        <BasicTooltip>
          <>Outline</>
        </BasicTooltip>
      ),
  )
}

export function uesConflicts() {
  return usePrism(() => {
    const ephemeralStateOfAllProjects = val(
      getStudio().ephemeralAtom.pointer.coreByProject,
    )
    return Object.entries(ephemeralStateOfAllProjects)
      .map(([projectId, state]) => ({projectId, state}))
      .filter(
        ({state}) =>
          state.loadingState.type === 'browserStateIsNotBasedOnDiskState',
      )
  }, [])
}

export function useMoreMenu() {
  const moreMenu = usePopover(
    () => {
      const triggerBounds = moreMenuTriggerRef.current!.getBoundingClientRect()
      return {
        debugName: 'More Menu',

        constraints: {
          maxX: triggerBounds.right,
          maxY: 8,
          // MVP: Don't render the more menu all the way to the left
          // when it doesn't fit on the screen height
          // See https://linear.app/theatre/issue/P-178/bug-broken-updater-ui-in-simple-html-page
          // 1/10 There's a better way to solve this.
          // 1/10 Perhaps consider separate constraint like "rightSideMinX" & for future: "bottomSideMinY"
          // 2/10 Or, consider constraints being a function of the dimensions of the box => constraints.
          minX: triggerBounds.left - 140,
          minY: 8,
        },
        verticalGap: 2,
      }
    },
    () => {
      return <MoreMenu />
    },
  )
  const moreMenuTriggerRef = useRef<HTMLButtonElement>(null)
  return {moreMenu, moreMenuTriggerRef}
}

export function useShouldShowUpdatesBadge(): boolean {
  const hasUpdates =
    useVal(
      getStudio().ahistoricAtom.pointer.updateChecker.result.hasUpdates,
    ) === true

  return useMemo(() => {
    if (window.__IS_VISUAL_REGRESSION_TESTING) {
      if (!showedVisualTestingWarning) {
        showedVisualTestingWarning = true
        console.warn(
          "Visual regression testing enabled, so we're showing the updates badge unconditionally",
        )
      }
    }
    if (hasUpdates || window.__IS_VISUAL_REGRESSION_TESTING) {
      return true
    }

    return hasUpdates
  }, [hasUpdates])
}
