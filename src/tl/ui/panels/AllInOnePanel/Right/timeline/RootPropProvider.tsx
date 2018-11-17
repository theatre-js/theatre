import React from 'react'
import {val} from '$shared/DataVerse/atom'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import {AllInOnePanelStuff} from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'
import {getSvgWidth} from '$tl/ui/panels/AllInOnePanel/Right/utils'
import {TDuration} from '$tl/ui/panels/AllInOnePanel/Right/types'
import {overshootDuration} from '$tl/ui/panels/AllInOnePanel/TimeUI/utils'
import { TimeStuff } from '$tl/ui/panels/AllInOnePanel/TimeStuffProvider';

interface IExportedComponentProps {
  children: React.ReactNode
}

interface IRootPropProviderProps extends IExportedComponentProps {
  timelineWidth: number
  duration: TDuration
  svgWidth: number
}

interface IState {}

export const RootPropGetterContext = React.createContext<TPropGetter>(() => {})
export const DurationContext = React.createContext<number>(0)

export type TPropName = 'svgWidth' | 'timelineWidth' | 'duration'
export type TPropGetter = (propName: TPropName) => any

class RootPropProvider extends React.PureComponent<
  IRootPropProviderProps,
  IState
> {
  render() {
    return (
      <PropsAsPointer props={this.props}>
        {({props: propsP}) => {
          const duration = val(propsP.duration)
          return (
            <RootPropGetterContext.Provider value={this.getProp}>
              <DurationContext.Provider value={duration}>
                {this.props.children}
              </DurationContext.Provider>
            </RootPropGetterContext.Provider>
          )
        }}
      </PropsAsPointer>
    )
  }

  getProp: TPropGetter = propName => {
    switch (propName) {
      case 'svgWidth':
        return this.props.svgWidth
      case 'timelineWidth':
        return this.props.timelineWidth
      case 'duration':
        return this.props.duration
    }
  }
}

export default (props: IExportedComponentProps) => (
  <TimeStuff>
    {timeStuffP => (
      <PropsAsPointer>
        {() => {
          const timelineTemplate = val(timeStuffP.timelineTemplate)
          const range = val(timeStuffP.rangeAndDuration.range)
          const duration = overshootDuration(
            val(timelineTemplate!._durationD),
          )
          const width = val(timeStuffP.viewportSpace.width)
          const rootPropProviderProps: IRootPropProviderProps = {
            duration,
            timelineWidth: width,
            svgWidth: getSvgWidth(range, duration, width),
            children: props.children,
          }
          return <RootPropProvider {...rootPropProviderProps} />
        }}
      </PropsAsPointer>
    )}
  </TimeStuff>
)
