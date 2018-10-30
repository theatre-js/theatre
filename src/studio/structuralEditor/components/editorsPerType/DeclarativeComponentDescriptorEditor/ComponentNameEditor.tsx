import React from 'react'
import * as css from './ComponentNameEditor.css'
import ExpressionlessStringEditor from '$theater/structuralEditor/components/reusables/ExpressionlessStringEditor'
import PanelSection from '$theater/structuralEditor/components/reusables/PanelSection'

type Props = {
  pathToComponentDescriptor: Array<string>
}

type State = {}

class ComponentNameEditor extends React.PureComponent<Props, State> {
  state: State
  props: Props

  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <PanelSection
        withTopMargin={true}
        withHorizontalMargin={true}
        label="Component Name"
      >
        <ExpressionlessStringEditor
          css={{container: css.stringEditor}}
          path={[...this.props.pathToComponentDescriptor, 'displayName']}
        />
      </PanelSection>
    )
  }
}

export default ComponentNameEditor
