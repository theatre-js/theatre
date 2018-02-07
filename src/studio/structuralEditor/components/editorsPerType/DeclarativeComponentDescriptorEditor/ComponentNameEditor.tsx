// @flow
import {React, compose} from '$studio/handy'
import css from './ComponentNameEditor.css'
import * as _ from 'lodash'
import ExpressionlessStringEditor from '$studio/structuralEditor/components/reusables/ExpressionlessStringEditor'
import PanelSection from '$studio/structuralEditor/components/reusables/PanelSection'
import {identity} from 'ramda'

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
