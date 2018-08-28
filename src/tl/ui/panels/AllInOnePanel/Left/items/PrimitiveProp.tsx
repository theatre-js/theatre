import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './PrimitiveProp.css'
import {Pointer} from '$shared/DataVerse2/pointer'
import {val} from '$shared/DataVerse2/atom'
import {PrimitivePropItem} from '../../utils'
import SvgIcon from '$shared/components/SvgIcon'
import arrowIcon from 'svg-inline-loader!./arrow.svg'
import {
  AllInOnePanelStuff,
  IAllInOnePanelStuff,
} from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import TimelineInstance from '$tl/timelines/TimelineInstance'
import TimelineInstanceObject from '$tl/objects/TimelineInstanceObject'
import {StaticValueContainer} from '$tl/Project/store/types'
import NumberValue from './PrimitiveProp/NumberValue'
import {ITempActionGroup} from '$shared/utils/redux/withHistory/actions'
import {GenericAction} from '$shared/types'

const classes = resolveCss(css)
interface IProps {
  item: PrimitivePropItem
}

interface IState {
  settingInput: boolean
}

export default class PrimitiveProp extends UIComponent<IProps, IState> {
  tempActionGroup: ITempActionGroup
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {settingInput: false}
    this.tempActionGroup = this.project._actions.historic.temp()
  }

  toggleExpansion = () => {
    this.ui.reduxStore.dispatch(
      this.ui.actions.historic.setPropExpansion({
        expanded: !this.props.item.expanded,
        ...this.props.item.address,
      }),
    )
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
    const timelineInstance = val(stuffP.timelineInstance) as TimelineInstance
    const objectInstance = timelineInstance.getObject(item.address.objectPath)

    return (
      <div
        {...classes('container', item.expanded && 'expanded')}
        style={{
          top: item.top + 'px',
          height: item.height + 'px',
          // @ts-ignore ignore
          '--depth': item.depth,
        }}
      >
        <div {...classes('bullet')} onClick={this.toggleExpansion}>
          <div {...classes('bulletIcon')}>
            {<SvgIcon sizing="fill" src={arrowIcon} />}
          </div>
        </div>
        <div {...classes('name')}>{item.address.propKey}</div>
        {this._renderValue(propsP, stateP, item, objectInstance)}
      </div>
    )
  }

  _renderInput(
    propsP: Pointer<IProps>,
    stateP: Pointer<IState>,
    item: PrimitivePropItem,
    objectInstance: TimelineInstanceObject,
  ) {}

  _renderValue(
    propsP: Pointer<IProps>,
    stateP: Pointer<IState>,
    item: PrimitivePropItem,
    objectInstance: TimelineInstanceObject,
  ) {
    const propStateP = this.project._selectors.historic.getPropState(
      this.project.atomP.historic,
      item.address,
    )
    const valueContainerP = propStateP.valueContainer
    const storedValueType = val(valueContainerP.type)

    const valEl = !storedValueType ? (
      <NumberValue
        temporarilySetValue={this.temporarilySetValueForStaticContainer}
        discardTemporaryValue={this.discardTemporaryValue}
        permenantlySetValue={this.permenantlySetValueForStaticContainer}
        value={0}
      />
    ) : storedValueType === 'StaticValueContainer' ? (
      <NumberValue
        value={val((valueContainerP as Pointer<StaticValueContainer>).value)}
        temporarilySetValue={this.temporarilySetValueForStaticContainer}
        discardTemporaryValue={this.discardTemporaryValue}
        permenantlySetValue={this.permenantlySetValueForStaticContainer}
      />
    ) : storedValueType === 'BezierCurvesOfScalarValues' ? (
      <NumberValue
        value={0}
        temporarilySetValue={this.temporarilySetValueForStaticContainer}
        discardTemporaryValue={this.discardTemporaryValue}
        permenantlySetValue={this.permenantlySetValueForStaticContainer}
      />
    ) : null

    return <div {...classes('value')}>{valEl}</div>
  }

  temporarilySetValueForStaticContainer = (value: number) => {
    this.project._dispatch(
      this.tempActionGroup.push(this._changeValueAction(value)),
    )
  }

  discardTemporaryValue = () => {
    this.project.reduxStore.dispatch(this.tempActionGroup.discard())
  }

  permenantlySetValueForStaticContainer = (v: number) => {
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
