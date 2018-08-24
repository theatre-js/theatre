import React from 'react'
import {val} from '$shared/DataVerse2/atom'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import {AllInOnePanelStuff} from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'
import {getSvgWidth} from '$tl/ui/panels/AllInOnePanel/Right/utils'
import {TDuration} from '$tl/ui/panels/AllInOnePanel/Right/types'

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
    const {duration, children} = this.props
    return (
      <RootPropGetterContext.Provider value={this.getProp}>
        <DurationContext.Provider value={duration}>
          {children}
        </DurationContext.Provider>
      </RootPropGetterContext.Provider>
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
  <AllInOnePanelStuff>
    {allInOnePanelStuffP => (
      <PropsAsPointer>
        {() => {
          const internalTimeline = val(allInOnePanelStuffP.internalTimeline)
          const range = val(
            internalTimeline!.pointerToRangeState.rangeShownInPanel,
          )
          const duration = val(internalTimeline!.pointerToRangeState.duration)
          const width = val(allInOnePanelStuffP.rightWidth)
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
  </AllInOnePanelStuff>
)
