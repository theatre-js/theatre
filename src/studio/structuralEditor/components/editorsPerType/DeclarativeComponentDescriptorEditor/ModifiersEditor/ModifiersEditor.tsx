import {React, compose, connect} from '$src/studio/handy'
import css from './ModifiersEditor.css'
import PanelSection from '$src/studio/structuralEditor/components/reusables/PanelSection'
import * as _ from 'lodash'

type Props = {
  pathToComponentDescriptor: Array<string>
}

type State = void

class ModifiersEditor extends React.PureComponent<Props, State> {
  state: State
  props: Props

  constructor(props: Props) {
    super(props)
    this.state = undefined
  }

  render() {
    const {componentDescriptor} = this.props

    return (
      <div className={css.container}>
        <PanelSection label="Modifiers">

        modifiers
        </PanelSection>
      </div>
    )
  }
}

export default compose(
  connect((s, op) => {
    return {
      componentDescriptor: _.get(s, op.pathToComponentDescriptor),
    }
  }),
)(ModifiersEditor)
