import {React, compose} from '$src/studio/handy'
import css from './DeclarativeComponentDescriptorEditor.css'
import ComponentNameEditor from '$src/studio/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/ComponentNameEditor'
import PropsEditor from '$src/studio/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/PropsEditor'
import TreeEditor from '$src/studio/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/TreeEditor/TreeEditor'
import {identity} from 'ramda'
import ModifiersEditor from './ModifiersEditor/ModifiersEditor'

type Props = {
  // path to comopnent descriptor
  path: Array<string>
}

type State = {}

export default class DeclarativeComponentDescriptorEditor extends React.PureComponent<
  Props,
  State
> {
  state = {}

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
