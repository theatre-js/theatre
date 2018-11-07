import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './PrimitiveProp.css'
import {Pointer} from '$shared/DataVerse2/pointer'
import {val} from '$shared/DataVerse2/atom'
import {PrimitivePropItem} from '../../utils'
import SvgIcon from '$shared/components/SvgIcon'
import arrowIcon from 'svg-inline-loader!./arrow.svg'
import {AllInOnePanelStuff} from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import {ITempActionGroup} from '$shared/utils/redux/withHistory/actions'
import projectSelectors from '$tl/Project/store/selectors'
import {StaticValueContainer} from '$tl/Project/store/types'
import BezierIcon from 'svg-inline-loader!./bezierIcon.svg'
import StaticIcon from 'svg-inline-loader!./staticIcon.svg'
import WithTooltip from '$shared/components/WithTooltip/WithTooltip';

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
      {() => (
        <PropsAsPointer props={this.props} state={this.state}>
          {({props: propsP}) => this._renderWithPointers(propsP)}
        </PropsAsPointer>
      )}
    </AllInOnePanelStuff>
  )

  _renderWithPointers(propsP: Pointer<IProps>) {
    const item = val(propsP.item)

    // const timelineInstance = val(stuffP.timelineInstance)
    // if (!timelineInstance) return null
    // const objectInstance = timelineInstance.getObject(item.address.objectPath)

    const propStateP = projectSelectors.historic.getPropState(
      this.project.atomP.historic,
      item.address,
    )

    const valueContainerP = propStateP.valueContainer as Pointer<
      StaticValueContainer
    >

    const valueContainerType =
      val(valueContainerP.type) || 'StaticValueContainer'

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
            {<SvgIcon sizing="absoluteFill" src={arrowIcon} />}
          </div>
        </div>
        <div {...classes('name')}>{item.address.propKey}</div>
        <WithTooltip inside={valueContainerType === 'StaticValueContainer' ? `Convert to Keyframes` : `Make Static`}>

        <div {...classes('trigger')} onClick={this.trigger}>
          {valueContainerType === 'StaticValueContainer' ? (
            <SvgIcon src={StaticIcon} />
            ) : (
              <SvgIcon src={BezierIcon} />
              )}
        </div>
              </WithTooltip>
      </div>
    )
  }

  trigger = () => {
    const item = this.props.item

    // const timelineInstance = val(stuffP.timelineInstance)
    // if (!timelineInstance) return null
    // const objectInstance = timelineInstance.getObject(item.address.objectPath)

    const propState = projectSelectors.historic.getPropState(
      this.project.reduxStore.getState().historic,
      item.address,
    )

    if (!propState) {
      this.project._dispatch(
        this.project._actions.historic.prop_convertPropToStaticValue(
          item.address,
        ),
      )
      return
    }

    const valueContainer = propState.valueContainer

    if (!valueContainer || valueContainer.type === 'StaticValueContainer') {
      this.project._dispatch(
        this.project._actions.historic.prop_convertPropToBezierCurves(
          item.address,
        ),
      )
    } else {
      this.project._dispatch(
        this.project._actions.historic.prop_convertPropToStaticValue(
          item.address,
        ),
      )
    }
  }
}
