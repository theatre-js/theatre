// @flow
import {React, connect, typeSystem} from '$studio/handy'
import get from 'lodash/get'
import specialisedEditors from './specialisedEditors'

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
    const type = typeSystem.types[typeName]
    if (!type) {
      throw new Error(`Cannot find a type named '${typeName}'`)
    }
    const EditorComponent = specialisedEditors[typeName]

    if (!EditorComponent) {
      throw new Error(`Type '${typeName}' doesn't have a visual editor yet`)
    }

    return <EditorComponent path={this.props.path} />
  }
}

export default connect((s, ownProps) => {
  if (ownProps.hasOwnProperty('typeName')) {
    const {typeName} = ownProps
    if (!typeName) {
      // @todo
      throw new Error(`typeName can only be a string and not empty`)
    }

    if (process.env.NODE_ENV === 'development') {
      const value = get(s, ownProps.path)
      if (!value || value.__descriptorType !== typeName) {
        throw new Error(`The value's __descriptorType doesn't match the required typeName`)
      }
    }

    return {typeName}
  } else {
    const value = get(s, ownProps.path)
    if (value == undefined) {
      throw new Error(`Path doesn't exist`)
    }

    return {
      typeName: value.__descriptorType,
    }
  }
})(ValueEditor)
