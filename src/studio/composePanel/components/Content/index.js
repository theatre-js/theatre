// @flow
import {React, connect, shouldUpdate, typeSystem} from '$studio/handy'
import css from './index.css'
import {ValueEditor} from '$studio/structuralEditor'
import type {
  ComponentDescriptor,
  ComponentId,
} from '$studio/componentModel/types'
import * as componentModelSelectors from '$studio/componentModel/selectors'
// import ListOfModifierInstantiationDescriptorsInspector from './ListOfModifierInstantiationDescriptorsInspector'

type Props =
  | {
      componentId: void,
      pathToComopnentDescriptor: void,
      componentDescriptor: void,
    }
  | {
      componentId: ComponentId,
      pathToComopnentDescriptor: Array<string>,
      componentDescriptor: ComponentDescriptor,
    }

type State = {}

export class ComposePanelContent extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  render() {
    const {
      componentId,
      pathToComopnentDescriptor,
      componentDescriptor,
    } = this.props

    if (!componentId || !pathToComopnentDescriptor || !componentDescriptor)
      return (
        // @todo
        <div className={css.container}>
          Some message for "please select a component" here
        </div>
      )

    if (componentDescriptor.type === 'Alias') {
      // @todo
      return <div className={css.container}>Some message for aliases here</div>
    } else if (componentDescriptor.type === 'HardCoded') {
      // @todo
      return (
        <div className={css.container}>
          Some message for hardCoded ones here
        </div>
      )
    } else {
      return (
        <ValueEditor
          path={pathToComopnentDescriptor}
          typeName={typeSystem.types.DeclarativeComponentDescriptor.typeName}
        />
      )
    }
  }

  // _renderCaseComponentInstantiationValueDescriptor(
  //   des: ComponentInstantiationValueDescriptor,
  //   path: Array<string>,
  // ) {
  //   const {modifierInstantiationDescriptors} = des

  //   return (
  //     <ListOfModifierInstantiationDescriptorsInspector
  //       pathToComopnentDescriptor={[
  //         ...path,
  //         'modifierInstantiationDescriptors',
  //       ]}
  //       modifierInstantiationDescriptors={modifierInstantiationDescriptors}
  //     />
  //   )
  // }
}

const connected = connect(s => {
  const possibleComponentId =
    s.composePanel.componentId || 'FakeDeclarativeButton'
  if (!possibleComponentId) {
    return {
      pathToComopnentDescriptor: undefined,
      componentDescriptor: undefined,
    }
  }

  const componentId = possibleComponentId
  const pathToComopnentDescriptor = componentModelSelectors.getPathToComponentDescriptor(
    componentId,
  )
  const componentDescriptor = componentModelSelectors.getComponentDescriptor(
    s,
    componentId,
  )

  return {
    pathToComopnentDescriptor,
    componentDescriptor,
    componentId,
  }
})(ComposePanelContent)

export default shouldUpdate(
  (prev, next) => prev.componentId !== next.componentId,
)(connected)
