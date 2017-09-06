
import * as React from 'react'
import compose from 'ramda/src/compose'
import {withSubscribables} from '$shared/DataVerse'

type Atom<T> = any

type Props = {
  children: Atom<React.Node>,
}

const PassThroughReactComponent = ({children}: Props) => {
  return children.toJS()
}

export default compose(
  withSubscribables((props: Props) => {
    return {
      childrenDeepChanges$: props.children.changesOnDescendantsAndSelf(),
    }
  }),
)(PassThroughReactComponent)