import resolveCss from '$shared/utils/resolveCss'
import PureComponentWithTheater from '$theater/componentModel/react/utils/PureComponentWithTheater'
import PropsAsPointer from '$theater/handy/PropsAsPointer'
import React from 'react'
import * as css from './DimensionsEditor.css'
import {Pointer} from '$shared/DataVerse2/pointer'
import {val} from '$shared/DataVerse2/atom'
import PanelSection from '$theater/structuralEditor/components/reusables/PanelSection'
import {get} from 'lodash'
import {IViewport} from '$theater/workspace/types'
import ExpressionlessNumberEditor from '$theater/structuralEditor/components/reusables/ExpressionlessNumberEditor'

type IProps = {
  css?: Partial<typeof css>
  viewportId: string
}

interface IState {}

export default class DimensionsEditor extends PureComponentWithTheater<
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
        {({props: propsP}) => {
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
