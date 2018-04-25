import * as css from './DeclarativeComponentDescriptorEditor.css'
import ComponentNameEditor from '$src/studio/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/ComponentNameEditor'
import TreeEditor from '$src/studio/structuralEditor/components/editorsPerType/DeclarativeComponentDescriptorEditor/TreeEditor/TreeEditor'
import ModifiersEditor from './ModifiersEditor/ModifiersEditor'
import React from 'react'

type Props = {
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
