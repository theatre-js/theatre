import resolveCss from '$shared/utils/resolveCss'
import PureComponentWithStudio from '$studio/componentModel/react/utils/PureComponentWithStudio'
import PropsAsPointer from '$studio/handy/PropsAsPointer'
import React from 'react'
import * as css from './DimensionsEditor.css'
import {Pointer} from '$shared/DataVerse2/pointer'
import {val} from '$shared/DataVerse2/atom'
import PanelSection from '$src/studio/structuralEditor/components/reusables/PanelSection'
import {get} from 'lodash'
import {IViewport} from '$studio/workspace/types'
import ExpressionlessNumberEditor from '$studio/structuralEditor/components/reusables/ExpressionlessNumberEditor'

type IProps = {
  css?: Partial<typeof css>
  viewportId: string
}

interface IState {}

export default class DimensionsEditor extends PureComponentWithStudio<
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

    return (
      <PropsAsPointer props={props as IProps}>
        {(propsP: Pointer<IProps>) => {
          const viewportId = val(propsP.viewportId)
          const path = pathToViewport(viewportId)

          return (
            <PanelSection label="Dimensions">
              <div {...classes('container')}>
                <ExpressionlessNumberEditor
                  path={[...path, 'dimensions', 'width']}
                />
                <ExpressionlessNumberEditor
                  path={[...path, 'dimensions', 'height']}
                />
                <ExpressionlessNumberEditor
                  path={[...path, 'position', 'x']}
                />
                <ExpressionlessNumberEditor
                  path={[...path, 'position', 'y']}
                />
              </div>
            </PanelSection>
          )
        }}
      </PropsAsPointer>
    )
  }
}

export const pathToViewport = (viewportId: string): string[] => [
  'historicWorkspace',
  'viewports',
  'byId',
  viewportId,
]
