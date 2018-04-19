import React from 'react'
import css from './ComponentNameEditor.css'
import ExpressionlessStringEditor from '$studio/structuralEditor/components/reusables/ExpressionlessStringEditor'
import PanelSection from '$studio/structuralEditor/components/reusables/PanelSection'

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
      <div className={css.container}>
        <PanelSection withTopMargin={true} withHorizontalMargin={true}>
          <ExpressionlessStringEditor
            label="Component Name"
            path={[...this.props.pathToComponentDescriptor, 'displayName']}
          />
        </PanelSection>
      </div>
    )
  }
}

export default ComponentNameEditor
