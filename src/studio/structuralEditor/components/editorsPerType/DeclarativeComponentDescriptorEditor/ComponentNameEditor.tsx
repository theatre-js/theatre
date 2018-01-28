// @flow
import {React, compose} from '$studio/handy'
import css from './ComponentNameEditor.css'
import * as _ from 'lodash'
import ExpressionlessStringEditor from '$studio/structuralEditor/components/reusables/ExpressionlessStringEditor'
import PanelSection from '$studio/structuralEditor/components/reusables/PanelSection'

type Props = {
  pathToComponentDescriptor: Array<string>
}

type State = void

class ComponentNameEditor extends React.PureComponent<Props, State> {
  state: State
  props: Props

  constructor(props: Props) {
    super(props)
    this.state = undefined
  }

  render() {
    return (
      <div className={css.container}>
        <PanelSection>
          <ExpressionlessStringEditor
            label="Component Name"
            path={[...this.props.pathToComponentDescriptor, 'displayName']}
          />
        </PanelSection>
      </div>
    )
  }
}

export default compose(a => a)(ComponentNameEditor)
