// @flow
import {React, D, PureComponentWithStudio} from '$studio/handy'
import _ from 'lodash'

type Props = {derivation: D.IDerivation<React.Node<any>>, key: string} & WithStudioProps
type State = {|lastValue: React.Node<any>|}

export default class DerivationAsReactElement extends PureComponentWithStudio<Props, State> {
  props: Props
  constructor(props: Props, context) {
    super(props, context)
    this._untapFromDerivationChanges = _.noop
  }

  componentWillMount() {
    this.listen(this.props)
  }

  listen(props: Props) {
    this._untapFromDerivationChanges =
      props.derivation.setDataVerseContext(this.studio.dataverseContext).changes(() => {this.forceUpdate()})
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