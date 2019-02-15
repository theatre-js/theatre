import {mapValues} from 'lodash-es'
import {useContext, Context} from 'react'
import React from 'react'
import {ReactComponent} from '$shared/types'

const withContext = <
  Contexts extends {[key: string]: Context<$IntentionalAny>}
>(
  contexts: Contexts,
) => <ComponentProps extends {}>(
  component: ReactComponent<ComponentProps>,
): React.SFC<
  {[Key in Exclude<keyof ComponentProps, keyof Contexts>]: ComponentProps[Key]}
> => {
  const Comp = component
  return (props: $IntentionalAny) => {
    const contextsValues = mapValues(contexts, ctx => useContext(ctx))
    return <Comp {...props} {...contextsValues} />
  }
}

export default withContext
