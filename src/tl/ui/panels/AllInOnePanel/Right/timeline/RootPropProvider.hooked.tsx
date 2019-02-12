import React, {Consumer} from 'react'
import {val, coldVal} from '$shared/DataVerse/atom'
import {getSvgWidth} from '$tl/ui/panels/AllInOnePanel/Right/utils'
import {TimeStuff} from '$tl/ui/panels/AllInOnePanel/TimeStuffProvider'
import {useMemo} from '$tl/ui/panels/AllInOnePanel/TimeStuffProvider.hooked'
import {useAutoDerive} from '../../TimeStuffProvider.hooked'

interface IProps {}

interface IState {}

type UseContextConsumer = <T>(c: Consumer<T>) => T

export const useContextConsumer: UseContextConsumer = null as $IntentionalAny

export const RootPropGetterContext = React.createContext<HOOKED_TPropGetter>(
  () => {},
)
export const DurationContext = React.createContext<number>(0)

export type HOOKED_TPropName = 'svgWidth' | 'timelineWidth' | 'duration'
export type HOOKED_TPropGetter = (propName: HOOKED_TPropName) => any

export default class HOOKED_RootPropProvider extends React.PureComponent<
  IProps,
  IState
> {
  hooked_render() {
    // @ts-ignore
    const timeStuffP = useContextConsumer(TimeStuff)
    const getProp = useMemo(
      (): HOOKED_TPropGetter => propName => {
        const timeStuff = coldVal(timeStuffP)
        switch (propName) {
          case 'svgWidth':
            return timeStuff.scrollSpace.width
          case 'timelineWidth':
            return timeStuff.viewportSpace.width
          case 'duration':
            return timeStuff.rangeAndDuration.overshotDuration
        }
      },
      [],
    )
    return useAutoDerive()(() => {
      const duration = val(timeStuffP.rangeAndDuration.overshotDuration)
      return (
        <RootPropGetterContext.Provider value={getProp}>
          <DurationContext.Provider value={duration}>
            {this.props.children}
          </DurationContext.Provider>
        </RootPropGetterContext.Provider>
      )
    })
  }
}
