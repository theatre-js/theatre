import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './PrimitiveProp.css'
import {Pointer} from '$shared/DataVerse2/pointer'
import {val, coldVal} from '$shared/DataVerse2/atom'
import {PrimitivePropItem} from '../../utils'
import SvgIcon from '$shared/components/SvgIcon'
import arrowIcon from 'svg-inline-loader!./arrow.svg'
import projectSelectors from '$tl/Project/store/selectors'
import {StaticValueContainer} from '$tl/Project/store/types'
import BezierIcon from 'svg-inline-loader!./bezierIcon.svg'
import StaticIcon from 'svg-inline-loader!./staticIcon.svg'
import WithTooltip from '$shared/components/WithTooltip/WithTooltip'
import {
  useAllInOnePanelStuff,
  useAutoDerive,
} from '../../TimeStuffProvider.hooked'

const classes = resolveCss(css)
interface IProps {
  item: PrimitivePropItem
}

interface IState {}

export default class HOOKED_PrimitiveProp extends UIComponent<IProps, IState> {
  hooked_render() {
    const {props} = this
    const {item} = props
    const stuffP = useAllInOnePanelStuff()
    const project = coldVal(stuffP.project)!
    const ui = coldVal(stuffP.ui)

    const toggleExpansion = () => {
      ui.reduxStore.dispatch(
        ui.actions.historic.setPropExpansion({
          expanded: !props.item.expanded,
          ...props.item.address,
        }),
      )
    }

    const trigger = () => {
      const propState = projectSelectors.historic.getPropState(
        project.reduxStore.getState().historic,
        item.address,
      )

      if (!propState) {
        project._dispatch(
          project._actions.historic.prop_convertPropToStaticValue(item.address),
        )
        return
      }

      const valueContainer = propState.valueContainer

      if (!valueContainer || valueContainer.type === 'StaticValueContainer') {
        project._dispatch(
          project._actions.historic.prop_convertPropToBezierCurves(
            item.address,
          ),
        )
      } else {
        project._dispatch(
          project._actions.historic.prop_convertPropToStaticValue(item.address),
        )
      }
    }

    return useAutoDerive()(() => {
      const propStateP = projectSelectors.historic.getPropState(
        project.atomP.historic,
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
          <div {...classes('bullet')} onClick={toggleExpansion}>
            <div {...classes('bulletIcon')}>
              {<SvgIcon sizing="absoluteFill" src={arrowIcon} />}
            </div>
          </div>
          <div {...classes('name')}>{item.address.propKey}</div>
          <WithTooltip
            inside={
              valueContainerType === 'StaticValueContainer'
                ? `Convert to Keyframes`
                : `Make Static`
            }
          >
            <div {...classes('trigger')} onClick={trigger}>
              {valueContainerType === 'StaticValueContainer' ? (
                <SvgIcon src={StaticIcon} />
              ) : (
                <SvgIcon src={BezierIcon} />
              )}
            </div>
          </WithTooltip>
        </div>
      )
    })
  }
}
