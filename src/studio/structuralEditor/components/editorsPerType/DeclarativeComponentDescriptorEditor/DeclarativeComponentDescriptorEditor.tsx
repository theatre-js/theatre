// @flow
import {React, compose} from '$src/studio/handy'
import css from './DeclarativeComponentDescriptorEditor.css'
import ComponentNameEditor from '$src/studio/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/ComponentNameEditor'
import PropsEditor from '$src/studio/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/PropsEditor'
import TreeEditor from '$src/studio/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/TreeEditor'
import {identity} from 'ramda'
import ModifiersEditor from './ModifiersEditor/ModifiersEditor'

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
        <ModifiersEditor pathToComponentDescriptor={this.props.path} />
      </div>
    )
  }
}

export default compose(identity)(DeclarativeComponentDescriptorEditor)
