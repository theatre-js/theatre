import * as t from '$shared/ioTypes'
import {difference} from '$shared/utils'
import DraggableArea from '$theater/common/components/DraggableArea/DraggableArea'
export type GenericAction = {type: string; payload: mixed}

export type ReduxReducer<State extends {}> = (
  s: undefined | State,
  action: GenericAction,
) => State

export type ErrorsOf<T> = T extends (
  ...args: $IntentionalAny[]
) => Generator_<infer R>
  ? R extends {errorType: string} ? R : never
  : never

export type ReturnOf<Fn> = Fn extends (
  ...args: $IntentionalAny[]
) => Generator_<infer R>
  ? R
  : never

export type PromiseValue<P> = P extends Promise<infer R> ? R : never

export type VoidFn = () => void

/**
 * Useful in type tests, such as: const a: SomeType = _any
 */
export const _any: $IntentionalAny = null

/**
 * Useful in typeTests. If you want to ensure that value v follows type V,
 * just write `expectType<V>(v)`
 */
export const expectType = <T extends mixed>(v: T): T => v

/**
 * An object of {list, byId} of type `type`, plus an invariant that
 * makes sure `list` only contains ids that exist in `byId`, and also
 * all `byId`s are listed in `list`
 */
export const listAndById = <T extends mixed>(type: t.Type<T>, name: string) =>
  t
    .type(
      {
        list: t.array(t.string),
        byId: t.record(t.string, type),
      },
      name,
    )
    .withRuntimeCheck(function listAndByIdInvariant(v: {
      list: string[]
      byId: Record<string, mixed>
    }) {
      const inListButNotInById = v.list.filter(id => !v.byId.hasOwnProperty(id))
      if (inListButNotInById.length > 0) {
        return [
          `List ids ${JSON.stringify(inListButNotInById)} don't exist in byId.`,
        ]
      }

      const diff = difference(Object.keys(v.byId), v.list)
      if (diff.length > 0) {
        return [
          `Keys ${JSON.stringify(diff)} are present in byId but not in list`,
        ]
      }

      return true
    })

/**
 * Takes a react component and returns the type of its props.
 *
 * class SomeComponent extends React.Component<IProps> {...}
 *
 * Props<typeof SomeComponent> // returns IProps
 *
 * @note It adds the 'children' prop even if the component doesn't requrie it.
 * I don't know how to fix that.
 */
export type PropsOf<Component> = Component extends (new (
  props: infer Props,
) => React.Component<$IntentionalAny>)
  ? Props
  : Component extends (props: infer Props) => React.ReactNode ? Props : never

export type ReactComponent<Props = $IntentionalAny> =
  | React.ComponentClass
  | React.SFC<Props>
