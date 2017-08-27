// @flow
import React from 'react'
import compose from 'ramda/src/compose'
import {
  type ComponentInstantiationDescriptor,
} from '$studio/componentModel/types'
import {withStudio, type WithStudioProps} from '$studio/utils'

type Wire<T> = {
  map<X>(fn: (a: T) => X): X,
  getValue(): T,
}

type Atom<T> = {
  getValue(): T,
  wireOf(eventType: 'changes'): Wire<void>,
}

type Props = WithStudioProps & {
  des: Atom<ComponentInstantiationDescriptor>,
}

type State = {}

class UserDefinedComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  render() {

    return <div>Rendering this shit {JSON.stringify('hi')}</div>
  }
}

export default compose(
  withStudio,
)(UserDefinedComponent)