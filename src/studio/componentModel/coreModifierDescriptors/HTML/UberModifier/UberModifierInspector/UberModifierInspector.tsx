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
          <div {...classes('title')}>Transform</div>
          <div {...classes('subGroup')}>
            <div {...classes('title')}>Translation</div>

            <div {...classes('body')}>
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

          <div {...classes('subGroup')}>
            <div {...classes('title')}>Scale</div>

            <div {...classes('body')}>
              <Input
                label="X"
                prop="scaleX"
                pathToModifierInstantiationDescriptor={
                  pathToModifierInstantiationDescriptor
                }
              />
              <Input
                label="Y"
                prop="scaleY"
                pathToModifierInstantiationDescriptor={
                  pathToModifierInstantiationDescriptor
                }
              />
              <Input
                label="Z"
                prop="scaleZ"
                pathToModifierInstantiationDescriptor={
                  pathToModifierInstantiationDescriptor
                }
              />
            </div>
          </div>

          <div {...classes('subGroup')}>
            <div {...classes('title')}>Rotate</div>

            <div {...classes('body')}>
              <Input
                label="X"
                prop="rotateX"
                pathToModifierInstantiationDescriptor={
                  pathToModifierInstantiationDescriptor
                }
              />
              <Input
                label="Y"
                prop="rotateY"
                pathToModifierInstantiationDescriptor={
                  pathToModifierInstantiationDescriptor
                }
              />
              <Input
                label="Z"
                prop="rotateZ"
                pathToModifierInstantiationDescriptor={
                  pathToModifierInstantiationDescriptor
                }
              />
            </div>
          </div>
        </div>

        <div {...classes('group')}>
          <div {...classes('title')}>Fill</div>
          <div {...classes('subGroup')}>
            <div {...classes('title')}>Opacity</div>

            <div {...classes('body')}>
            <Input
                label="Opacity"
                prop="opacity"
                pathToModifierInstantiationDescriptor={
                  pathToModifierInstantiationDescriptor
                }
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
