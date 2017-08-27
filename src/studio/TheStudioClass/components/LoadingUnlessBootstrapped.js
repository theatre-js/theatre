// @flow
// This will be some sort of loading indicator to show before the studio is ready to function
import * as React from 'react'
import compose from 'ramda/src/compose'
import {withStudio, withSubscriptions, type WithStudioProps} from '$studio/utils'
import {type Subscribable, type Atom, withSubscribables} from '$shared/DataVerse'

type Props = WithStudioProps & {
  children: React.Node,
}


const LoadingUnlessBootstrapped = (props: Props) => {
  return (
    !props.studio.atom.get(['common', 'temp', 'bootstrapped']) ? <div>Loading...</div> : props.children
  )
}

/**
 * Shows a splash screen, unless we're bootstrapped (see bootstrapped in $common/reducer)
 */
export default compose(
  withSubscriptions(({studio}: Props) => [
    studio.atom.subscribeTo(['common', 'temp', 'bootstrapped']),
  ]),
  withStudio,
)(LoadingUnlessBootstrapped)


const LoadingUnlessBootstrappedWithStreams = ({bootstrapped, children}: {children: React.Node, bootstrapped: Subscribable<Atom<boolean>>}) => {
  return (
    !bootstrapped.getValue() ? <div>Loading...</div> : children
  )
}

compose(
  withSubscribables(({studio}: Props) => {
    const bootstrapped = studio.atom.getIn(['common', 'temp', 'bootstrapped'])
    return {
      bootstrapped: bootstrapped.eventsFor('changes').map(() => bootstrapped.getValue()),
    }
  }),
  withStudio,
)(LoadingUnlessBootstrappedWithStreams)