const getPropsInCommon = (a: object, b: Object): Array<string | number> => {
  const keysInA = Object.keys(a)

  const inCommon: Array<string | number> = []
  for (const key of keysInA) {
    if (b.hasOwnProperty(key)) {
      inCommon.push(key)
    }
  }

  return inCommon
}

export default getPropsInCommon
