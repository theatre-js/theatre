import {React, compose} from '$studio/handy'
import css from './index.css'
import PanelSection from '$studio/structuralEditor/components/reusables/PanelSection'

type Props = {
  pathToComponentDescriptor: Array<string>
}

type State = void

class PropsEditor extends React.PureComponent<Props, State> {
  state: State
  props: Props

  constructor(props: Props) {
    super(props)
    this.state = undefined
  }

  render() {
    return (
      <div className={css.container}>
        <PanelSection label="Props">
          <div className={css.dragStHereMsg}>
            Drag a value here to define a new prop
          </div>
        </PanelSection>
      </div>
    )
  }
}

export default compose(a => a)(PropsEditor)
