// @flow
import {React, connect, typeSystem} from '$studio/handy'
import get from 'lodash/get'

type Props = {
  path: Array<string>,
  typeName: string,
}

type State = void

class ValueEditor extends React.PureComponent<Props, State> {
  state: State
  props: Props

  constructor(props: Props) {
    super(props)
    this.state = undefined
  }

  render() {
    const {typeName} = this.props
    const type = typeSystem[typeName]
    if (!type) {
      throw new Error(`Cannot find a type named '${typeName}'`)
    }
    const {visualEditorComponent} = type
    if (!visualEditorComponent) {
      throw new Error(`Type '${typeName}' doesn't have a visual editor yet`)
    }

    return <visualEditorComponent path={this.props.path} />
  }
}

export default connect((s, ownProps) => {
  if (ownProps.hasOwnProperty('typeName')) {
    const {typeName} = ownProps
    if (!typeName) {
      // @todo
      throw new Error(`This shoudl never happen`)
    }

    if (process.env.NODE_ENV === 'development') {
      const value = get(s, ownProps.path)
      if (!value || value.typeName !== typeName) {
        throw new Error(`This is a bug`)
      }
    }

    return {typeName}
  } else {
    const value = get(s, ownProps.path)
    if (value == undefined) {
      throw new Error(`This should never happen`)
    }

    return {
      typeName: value.typeName,
    }
  }
})(ValueEditor)
