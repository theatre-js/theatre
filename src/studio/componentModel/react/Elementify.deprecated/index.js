
import * as React from 'react'
import compose from 'ramda/src/compose'
import {
  type ComponentInstantiationDescriptor,
  type ComponentDescriptor,
} from '$studio/componentModel/types'
import {withStudio, type WithStudioProps} from '$studio/utils'
import UserDefinedComponent from './UserDefinedComponent'
import UserCodedComponent from './UserCodedComponent'
import TheaterJSCodedComponent from './TheaterJSCodedComponent'

type BaseProps = WithStudioProps & {
  instantiationDescriptor$: DeprecatedAtom<ComponentInstantiationDescriptor>,
}

type Props = BaseProps & {
  componentDescriptor$$: Subscribable<DeprecatedAtom<ComponentDescriptor>>,
  componentType$$: Subscribable<DeprecatedAtom<string>>,
}

type State = {}

class Elementify extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  render() {
    const {componentType$$, componentDescriptor$$} = this.props
    const componentType = componentType$$.getValue().getValue()

    const RendererComponent =
      componentType === 'UserDefinedComponent' ? UserDefinedComponent :
      componentType === 'TheaterJSCodedComponent' ? TheaterJSCodedComponent :
      componentType === 'UserCodedComponent' ? UserCodedComponent : null

    if (RendererComponent) {
      return <RendererComponent
        instantiationDescriptor$={this.props.instantiationDescriptor$}
        componentDescriptor$={componentDescriptor$$.getValue()}
        />
    } else {
      // @todo
      return null
    }
  }
}

const FinalComponent = compose(
  withSubscribables(({studio, instantiationDescriptor$}: Props) => {
    const componentDescriptor$$ =
      instantiationDescriptor$
        .get('componentID')
        .changeEvents()
        .map((componentID$) =>
          studio.getComponentDescriptor(componentID$.getValue())
        )

    const componentType$$ = componentDescriptor$$.flatMap(
      // $FixMe
      (componentDescriptorAtom) => componentDescriptorDeprecatedAtom.get('type').changeEvents()
    )

    return {
      componentDescriptor$$,
      componentType$$,
    }
  }),
  withStudio,
)(Elementify)

export default FinalComponent