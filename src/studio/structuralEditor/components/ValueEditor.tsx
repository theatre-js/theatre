import {React, connect, typeSystem, StudioComponent} from '$studio/handy'
import get from 'lodash/get'
import editorsPerType from './editorsPerType/editorsPerType'
import {IStoreState} from '$studio/types'

interface IOwnProps {
  path: string[]
  typeName?: string
}

interface IProps extends IOwnProps {
  typeName: string
}

type State = {}

class ValueEditor extends StudioComponent<IProps, State> {
  render() {
    const {typeName} = this.props
    const type = typeSystem.types[typeName]
    if (!type) {
      throw new Error(`Cannot find a type named '${typeName}'`)
    }
    const EditorComponent = editorsPerType[typeName]

    if (!EditorComponent) {
      throw new Error(`Type '${typeName}' doesn't have a structural editor yet`)
    }

    return <EditorComponent path={this.props.path} />
  }
}

export default connect((s: IStoreState, op: IOwnProps) => {
  if (op.hasOwnProperty('typeName')) {
    const {typeName} = op
    if (!typeName) {
      // @todo
      throw new Error(`typeName can only be a string and not empty`)
    }

    if (process.env.NODE_ENV === 'development') {
      const value = get(s, op.path)
      if (!value || value.__descriptorType !== typeName) {
        throw new Error(
          `The value's __descriptorType doesn't match the required typeName`,
        )
      }
    }

    return {typeName}
  } else {
    const value = get(s, op.path)
    if (value == undefined) {
      throw new Error(`Path doesn't exist`)
    }

    return {
      typeName: value.__descriptorType,
    }
  }
})(ValueEditor)
