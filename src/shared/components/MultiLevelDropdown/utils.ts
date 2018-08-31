import memoizeOne from 'memoize-one'
import {TItems} from '$shared/components/MultiLevelDropdown/MultiLevelDropdown'
import InternalTimeline from '$tl/timelines/InternalTimeline'
import {flatMap} from '$shared/utils'
import {get, setImmutable as set} from '$shared/utils'

type TInternalTimelines = {
  [path: string]: InternalTimeline
}

export const convertInternalTimelinesToItems = memoizeOne(
  (internalTimelines: TInternalTimelines): TItems => {
    return Object.keys(internalTimelines).reduce(
      (items, stringPath) => {
        const pathArray = stringPath.split(' / ')
        for (let i = 1, l = pathArray.length; i <= l; i++) {
          const currentPath = pathArray.slice(0, i)
          const internalPath = flatMap(currentPath, p => [
            p,
            '__subItems__',
          ]).slice(0, -1)
          if (get(items, internalPath) == null) {
            const item = {
              isSelectable: i === l,
              isLeaf: i === l,
              path: currentPath,
              __subItems__: {},
            }
            items = set(internalPath, item, items)
          } else {
            if (i === l) {
              items = set(internalPath.concat('isSelectable'), true, items)
            }
          }
        }
        return items
      },
      {} as TItems,
    )
  },
)

export const isInActivePath = (activePath: string[], itemPath: string[]) => {
  return itemPath.slice(-1)[0] === activePath[itemPath.length - 1]
}

export const isInsideTriangle = (
  point: [number, number],
  mouse: [number, number],
  top: [number, number],
  bottom: [number, number],
): boolean => {
  const a1 = Math.atan2(top[1] - mouse[1], top[0] - mouse[0])
  const a2 = Math.atan2(bottom[1] - mouse[1], bottom[0] - mouse[0])
  const d = Math.atan2(point[1] - mouse[1], point[0] - mouse[0])
  return d >= a1 && d <= a2
}

export const getDistance2 = (a: [number, number], b: [number, number]) => {
  return (a[1] - b[1]) ** 2 + (a[0] - b[0]) ** 2
}
