// @flow
import {React, compose} from '$studio/handy'
import css from './index.css'
import ComponentNameEditor from './ComponentNameEditor'
import PropsEditor from './PropsEditor'
import TreeEditor from './TreeEditor'
import ModifiersEditor from './ModifiersEditor'
import {identity} from 'ramda'

type Props = {
  // path to comopnent descriptor
  path: Array<string>
}

type State = void

class DeclarativeComponentDescriptorEditor extends React.PureComponent<
  Props,
  State
> {
  state: State
  props: Props

  constructor(props: Props) {
    super(props)
    this.state = undefined
  }

  render() {
    return (
      <div className={css.container}>
        <ComponentNameEditor pathToComponentDescriptor={this.props.path} />
        {/* <PropsEditor pathToComponentDescriptor={this.props.path} /> */}
        <TreeEditor pathToComponentDescriptor={this.props.path} />
        {/* <ModifiersEditor pathToComponentDescriptor={this.props.path} /> */}
      </div>
    )
  }
}

export default compose(identity)(DeclarativeComponentDescriptorEditor)
