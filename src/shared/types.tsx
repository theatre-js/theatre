export type GenericAction = {type: string; payload: mixed}

export type ReduxReducer<State extends {}> = (
  s: undefined | State,
  action: GenericAction,
) => State

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
  : Component extends (props: infer Props) => React.ReactNode
  ? Props
  : never

export type ReactComponent<Props = $IntentionalAny> =
  | React.ComponentClass<Props>
  | React.SFC<Props>
