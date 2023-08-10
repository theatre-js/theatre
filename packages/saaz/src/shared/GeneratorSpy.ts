import type {$IntentionalAny, GeneratorRecordings} from '../types'
import {cloneDeep} from 'lodash-es'
import type {SerializableValue} from '../types'
import type {ValidGenerators} from '../types'
import {stableValueHash} from '@theatre/utils/stableJsonStringify'

export function createGeneratorsSpy<Generators extends ValidGenerators>(
  generators: ValidGenerators,
  prevREcordings: GeneratorRecordings = {},
  playbackOnly: boolean = false,
): [spy: Generators, recordings: GeneratorRecordings] {
  const recordings: GeneratorRecordings = cloneDeep(prevREcordings)
  const calls: Record<string, number> = {}

  const spy: Generators = Object.fromEntries(
    Object.entries(generators).map(([fnName, fn]) => {
      if (typeof fn !== 'function') {
        throw new Error(`Generator method "${fnName}" is not a function`)
      }
      if (typeof fnName !== 'string') {
        throw new Error('key is not a string')
      }

      const spyFn = (...args: SerializableValue[]) => {
        const key = stableValueHash([fnName, args])
        if (!calls[key]) {
          calls[key] = 0
        } else {
          calls[key]!++
        }

        const callIndex = calls[key]!

        if (
          playbackOnly &&
          (!Array.isArray(recordings[key]) ||
            recordings[key]!.length < callIndex)
        ) {
          throw new Error(
            `Generator method "${fnName}" was called with arguments that were not recorded: ${JSON.stringify(
              args,
            )}`,
          )
        }

        if (!recordings[key]) {
          recordings[key] = []
        }

        if (recordings[key]!.length > callIndex) {
          return recordings[key]![callIndex]!
        } else {
          const ret = fn(args[0])
          recordings[key]![callIndex] = ret
          return ret
        }
      }

      return [fnName, spyFn] as const
    }),
  ) as $IntentionalAny

  return [spy, recordings]
}
