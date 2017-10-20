// @flow
import {React, D, withStudio, type WithStudioProps} from '$studio/handy'
import compose from 'ramda/src/compose'
import _ from 'lodash'

type Props = {derivation: D.IDerivation<React.Node<any>>, key: string} & WithStudioProps
type State = {|lastValue: React.Node<any>|}

export class DerivationAsReactElement extends React.PureComponent<Props, State> {
  props: Props
  constructor(props: Props) {
    super(props)
    this._untapFromDerivationChanges = _.noop
  }

  componentWillMount() {
    this.listen(this.props)
  }

  listen(props: Props) {
    this._untapFromDerivationChanges =
      props.derivation.setDataVerseContext(props.studio.dataverseContext).changes(() => {this.forceUpdate()})
  }

  componentWillUnmount() {
    this._untapFromDerivationChanges()
  }

  componentWillReceiveProps(newProps) {
    this._untapFromDerivationChanges()
    this.listen(newProps)
  }

  render() {
    return this.props.derivation.getValue()
  }
}

export default compose(
  withStudio,
)(DerivationAsReactElement)