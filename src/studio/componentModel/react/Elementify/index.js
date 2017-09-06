// @flow
import * as React from 'react'
import compose from 'ramda/src/compose'
import {type ComponentInstantiationDescriptor} from '$studio/componentModel/types'
import * as D from '$shared/DataVerse'

type Props = {
  descriptor: D.ReferencifyDeepObject<ComponentInstantiationDescriptor>,
}

class Elementify extends React.Component<Props, void> {
  constructor(props: Props) {
    super(props)
  }

  render() {
    return <div>Elementify here, {JSON.stringify(this.props.descriptor.unboxDeep())}</div>
  }
}

export default compose(
  (a) => a
)(Elementify)