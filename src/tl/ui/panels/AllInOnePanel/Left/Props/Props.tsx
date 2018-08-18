import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './Props.css'
import {AllInOnePanelStuff} from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import {val} from '$shared/DataVerse2/atom'
import InternalTimeline from '$tl/timelines/InternalTimeline'
import Prop from '$tl/ui/panels/AllInOnePanel/Left/Props/Prop'

const classes = resolveCss(css)

const alphabeticalCompare = function(a: string, b: string) {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

interface IProps {
  css?: Partial<typeof css>
  depth: number
  path: string
}

interface IState {}

export default class Props extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  render() {
    return (
      <AllInOnePanelStuff>
        {stuffP => (
          <PropsAsPointer props={this.props} state={this.state}>
            {p => {
              const internalTimeline = val(
                stuffP.internalTimeline,
              ) as InternalTimeline
              const path = val(p.props.path)

              const internalObject = val(
                internalTimeline._internalObjects.pointer[path],
              )

              const nativeObjectType = internalObject.nativeObjectType
              const props = nativeObjectType.props
              const propKeys = Object.keys(props).sort(alphabeticalCompare)

              return (
                <div {...classes('container')}>
                  {propKeys.map(propKey => {
                    return (
                      <Prop
                        key={'prop:' + propKey}
                        propKey={propKey}
                        internalObject={internalObject}
                      />
                    )
                  })}
                </div>
              )
            }}
          </PropsAsPointer>
        )}
      </AllInOnePanelStuff>
    )
  }
}
