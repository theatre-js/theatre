import type {Observable, ObservedValueOf} from 'rxjs'

export function combineLatestObj<T extends Record<string, Observable<any>>>(
  rec: T,
): Observable<
  {
    [P in keyof T]: ObservedValueOf<T[P]>
  }
> {
  const keys = Object.keys(rec)
  const template = Object.fromEntries(keys.map((k) => [k, null]))
  // @ts-ignore I promise this works
  return combineLatest(keys.map((key) => rec[key])).map((values) => {
    // use pre-propertied object as template
    const temp = {...template}
    for (let i = 0; i < values.length; i++) {
      temp[keys[i]] = values[i]
    }
    return temp
  })
}
