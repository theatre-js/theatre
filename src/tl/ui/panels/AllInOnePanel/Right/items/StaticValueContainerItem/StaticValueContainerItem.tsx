import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './StaticValueContainerItem.css'
import {Pointer} from '$shared/DataVerse2/pointer'
import {val} from '$shared/DataVerse2/atom'
import {PrimitivePropItem} from '$tl/ui/panels/AllInOnePanel/utils'
import projectSelectors from '$tl/Project/store/selectors'
import {StaticValueContainer} from '$tl/Project/store/types'
import {
  AllInOnePanelStuff,
  IAllInOnePanelStuff,
} from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import NumberEditor from './editors/NumberEditor'
import {ITempActionGroup} from '$shared/utils/redux/withHistory/actions'
import {GenericAction} from '$shared/types'

interface IProps {
  css?: Partial<typeof css>
  item: PrimitivePropItem
}

interface IState {}

const classes = resolveCss(css)

export default class StaticValueContainerItem extends UIComponent<
  IProps,
  IState
> {
  tempActionGroup: ITempActionGroup

  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
    this.tempActionGroup = this.project._actions.historic.temp()
  }

  render = () => (
    <AllInOnePanelStuff>
      {stuffP => (
        <PropsAsPointer props={this.props} state={this.state}>
          {({props: propsP, state: stateP}) =>
            this._renderWithPointers(propsP, stateP, stuffP)
          }
        </PropsAsPointer>
      )}
    </AllInOnePanelStuff>
  )

  _renderWithPointers(
    propsP: Pointer<IProps>,
    stateP: Pointer<IState>,
    stuffP: Pointer<IAllInOnePanelStuff>,
  ) {
    const item = val(propsP.item)
    const timelineInstance = val(stuffP.timelineInstance)
    if (!timelineInstance) return null
    // const objectInstance = timelineInstance.getObject(item.address.objectPath)

    const propStateP = projectSelectors.historic.getPropState(
      this.project.atomP.historic,
      item.address,
    )

    const valueContainerP = propStateP.valueContainer as Pointer<
      StaticValueContainer
    >

    const valueContainer = val(valueContainerP)

    if (valueContainer && valueContainer.type !== 'StaticValueContainer')
      return null

    const possibleStoredValue: number | undefined = valueContainer && valueContainer.value
    const value =
      typeof possibleStoredValue === 'number' ? possibleStoredValue : 0

    const el = (
      <NumberEditor
        temporarilySetValue={this.temporarilySetValue}
        discardTemporaryValue={this.discardTemporaryValue}
        permenantlySetValue={this.permenantlySetValue}
        value={value}
      />
    )

    return <div {...classes('container')}>{el}</div>
  }

  temporarilySetValue = (value: number) => {
    this.project._dispatch(
      this.tempActionGroup.push(this._changeValueAction(value)),
    )
  }

  discardTemporaryValue = () => {
    this.project.reduxStore.dispatch(this.tempActionGroup.discard())
  }

  permenantlySetValue = (v: number) => {
    this.project._dispatch(
      this.tempActionGroup.discard(),
      this._changeValueAction(v),
    )
  }

  private _changeValueAction(value: number): GenericAction {
    return this.project._actions.historic.prop_setNumberValueInStaticValueContainer(
      {...this.props.item.address, value},
    )
  }
}
