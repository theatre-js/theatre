import type {
  Keyframe,
  TrackData,
} from '@theatre/core/projects/store/types/SheetState_Historic'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type {PathToProp} from '@theatre/shared/utils/addresses'
import type {SequenceTrackId} from '@theatre/shared/utils/ids'
import type {$IntentionalAny, VoidFn} from '@theatre/shared/utils/types'
import type {Pointer} from '@theatre/dataverse'
import React, {useMemo, useRef, useState} from 'react'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import {graphEditorColors} from '@theatre/studio/panels/SequenceEditorPanel/GraphEditor/GraphEditor'
import KeyframeEditor from './KeyframeEditor/KeyframeEditor'
import {
  getPropConfigByPath,
  isPropConfigComposite,
  valueInProp,
} from '@theatre/shared/propTypes/utils'
import type {PropTypeConfig_AllSimples} from '@theatre/core/propTypes'

export type ExtremumSpace = {
  fromValueSpace: (v: number) => number
  toValueSpace: (v: number) => number
  deltaToValueSpace: (v: number) => number
  lock(): VoidFn
}

const BasicKeyframedTrack: React.VFC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
  sheetObject: SheetObject
  pathToProp: PathToProp
  trackId: SequenceTrackId
  trackData: TrackData
  color: keyof typeof graphEditorColors
}> = React.memo(
  ({layoutP, trackData, sheetObject, trackId, color, pathToProp}) => {
    const propConfig = getPropConfigByPath(
      sheetObject.template.config,
      pathToProp,
    )! as PropTypeConfig_AllSimples

    if (isPropConfigComposite(propConfig)) {
      console.error(`Composite prop types cannot be keyframed`)
      return <></>
    }

    const [areExtremumsLocked, setAreExtremumsLocked] = useState<boolean>(false)
    const lockExtremums = useMemo(() => {
      const locks = new Set<VoidFn>()
      return function lockExtremums() {
        const shouldLock = locks.size === 0
        locks.add(unlock)
        if (shouldLock) setAreExtremumsLocked(true)

        function unlock() {
          const wasLocked = locks.size > 0
          locks.delete(unlock)
          if (wasLocked && locks.size === 0) setAreExtremumsLocked(false)
        }

        return unlock
      }
    }, [])

    const extremumSpace: ExtremumSpace = useMemo(() => {
      const extremums =
        propConfig.type === 'number'
          ? calculateScalarExtremums(trackData.keyframes, propConfig)
          : calculateNonScalarExtremums(trackData.keyframes)

      const fromValueSpace = (val: number): number =>
        (val - extremums[0]) / (extremums[1] - extremums[0])

      const toValueSpace = (ex: number): number =>
        extremums[0] + deltaToValueSpace(ex)

      const deltaToValueSpace = (ex: number): number =>
        ex * (extremums[1] - extremums[0])

      return {
        fromValueSpace,
        toValueSpace,
        deltaToValueSpace,
        lock: lockExtremums,
      }
    }, [trackData.keyframes])

    const cachedExtremumSpace = useRef<ExtremumSpace>(
      undefined as $IntentionalAny,
    )
    if (!areExtremumsLocked) {
      cachedExtremumSpace.current = extremumSpace
    }

    const keyframeEditors = trackData.keyframes.map((kf, index) => (
      <KeyframeEditor
        propConfig={propConfig}
        keyframe={kf}
        index={index}
        trackData={trackData}
        layoutP={layoutP}
        sheetObject={sheetObject}
        trackId={trackId}
        isScalar={propConfig.type === 'number'}
        key={kf.id}
        extremumSpace={cachedExtremumSpace.current}
        color={color}
      />
    ))

    return (
      <g
        style={{
          // @ts-ignore
          '--main-color': graphEditorColors[color].iconColor,
        }}
      >
        {keyframeEditors}
      </g>
    )
  },
)

export default BasicKeyframedTrack

type Extremums = [min: number, max: number]

function calculateScalarExtremums(
  keyframes: Keyframe[],
  propConfig: PropTypeConfig_AllSimples,
): Extremums {
  let min = Infinity,
    max = -Infinity

  function check(n: number): void {
    min = Math.min(n, min)
    max = Math.max(n, max)
  }

  keyframes.forEach((cur, i) => {
    const curVal = valueInProp(cur.value, propConfig) as number
    check(curVal)
    if (!cur.connectedRight) return
    const next = keyframes[i + 1]
    if (!next) return
    const diff = (typeof next.value === 'number' ? next.value : 1) - curVal
    check(curVal + cur.handles[3] * diff)
    check(curVal + next.handles[1] * diff)
  })

  return [min, max]
}

function calculateNonScalarExtremums(keyframes: Keyframe[]): Extremums {
  let min = 0,
    max = 1

  function check(n: number): void {
    min = Math.min(n, min)
    max = Math.max(n, max)
  }

  keyframes.forEach((cur, i) => {
    if (!cur.connectedRight) return
    const next = keyframes[i + 1]
    if (!next) return
    check(cur.handles[3])
    check(next.handles[1])
  })

  return [min, max]
}
