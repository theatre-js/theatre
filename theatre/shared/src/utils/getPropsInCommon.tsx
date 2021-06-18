import type {$FixMe} from './types'

const getPropsInCommon = (a: $FixMe, b: $FixMe): (string | number)[] => {
  const keysInA = Object.keys(a)

  const inCommon: (string | number)[] = []
  for (const key of keysInA) {
    if (b.hasOwnProperty(key)) {
      inCommon.push(key)
    }
  }

  return inCommon
}

export default getPropsInCommon
