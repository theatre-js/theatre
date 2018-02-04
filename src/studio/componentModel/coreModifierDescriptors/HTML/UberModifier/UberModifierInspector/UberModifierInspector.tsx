import {StudioComponent, React, resolveCss} from '$studio/handy'
import * as css from './UberModifierInspector.css'
import Input from './Input'

interface IProps {
  pathToModifierInstantiationDescriptor: string[]
  css?: any
}

interface IState {}

export default class UberModifierInspector extends StudioComponent<
  IProps,
  IState
> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  render() {
    const {props} = this
    const classes = resolveCss(css, props.css)
    const {pathToModifierInstantiationDescriptor} = props

    return (
      <div {...classes('container')}>
        <div {...classes('group')}>
          <div {...classes('groupTitle')}>Transition</div>
          <div {...classes('groupBody')}>
            <Input
              label="X"
              prop="translationX"
              pathToModifierInstantiationDescriptor={
                pathToModifierInstantiationDescriptor
              }
            />
            <Input
              label="Y"
              prop="translationY"
              pathToModifierInstantiationDescriptor={
                pathToModifierInstantiationDescriptor
              }
            />
            <Input
              label="Z"
              prop="translationZ"
              pathToModifierInstantiationDescriptor={
                pathToModifierInstantiationDescriptor
              }
            />
          </div>
        </div>
      </div>
    )
  }
}
