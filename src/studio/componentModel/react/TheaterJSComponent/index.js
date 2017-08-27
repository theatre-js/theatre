// @flow
import React from 'react'
import compose from 'ramda/src/compose'
import {
  type ComponentInstantiationDescriptor,
  type ComponentDescriptor,
} from '$studio/componentModel/types'
import {withStudio, type WithStudioProps} from '$studio/utils'
import {withSubscribables, type Atom, type Subscribable, default as DataVerse} from '$shared/DataVerse'
import UserDefinedComponent from './UserDefinedComponent'
import UserCodedComponent from './UserCodedComponent'
import TheaterJSCodedComponent from './TheaterJSCodedComponent'

type BaseProps = WithStudioProps & {
  instantiationDescriptor$: Atom<ComponentInstantiationDescriptor>,
}

type Props = BaseProps & {
  componentDescriptor$$: Subscribable<Atom<ComponentDescriptor>>,
  componentType$$: Subscribable<Atom<string>>,
}

type State = {}

class TheaterJSComponent extends React.Component<Props, State> {
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
        studio.atom.getIn(['componentDescriptors', componentID$.getValue()])
    )

    const componentType$$ = componentDescriptor$$.flatMap(
      (componentDescriptorAtom) => componentDescriptorAtom.get('type').changeEvents()
    )

    return {
      componentDescriptor$$,
      componentType$$,
    }
  }),
  withStudio,
)(TheaterJSComponent)

export default FinalComponent