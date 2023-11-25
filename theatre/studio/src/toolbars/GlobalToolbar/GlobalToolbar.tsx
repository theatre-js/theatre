import {useVal} from '@theatre/react'
import getStudio from '@theatre/studio/getStudio'
import React from 'react'
import styled from 'styled-components'
import ExtensionToolbar from '@theatre/studio/toolbars/ExtensionToolbar/ExtensionToolbar'
import {
  useNotifications,
  useEmptyNotificationsTooltip,
} from '@theatre/studio/notify'
import {
  uesConflicts,
  useOutlineTriggerTooltip,
  useMoreMenu,
  useShouldShowUpdatesBadge,
} from './globalToolbarHooks'
import LeftStrip from './LeftStrip/LeftStrip'
import RightStrip from './RightStrip/RightStrip'

const Container = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  top: 12px;
  height: 42px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
`

const NumberOfConflictsIndicator = styled.div`
  color: white;
  width: 14px;
  height: 14px;
  background: #d00;
  border-radius: 4px;
  text-align: center;
  line-height: 14px;
  font-weight: 600;
  font-size: 8px;
  position: relative;
  left: -6px;
  top: -11px;
  margin-right: -14px;
  box-shadow: 0 4px 6px -4px #00000059;
`

const SubContainer = styled.div`
  display: flex;
  gap: 8px;
`

const HasUpdatesBadge = styled.div<{type: 'info' | 'warning'}>`
  position: absolute;
  background: ${({type}) => (type === 'info' ? '#40aaa4' : '#f59e0b')};
  width: 6px;
  height: 6px;
  border-radius: 50%;
  right: -2px;
  top: -2px;
`

const GlobalToolbar: React.FC = () => {
  const conflicts = uesConflicts()
  const [outlineTriggerTooltip, outlineTriggerRef] =
    useOutlineTriggerTooltip(conflicts)

  const outlinePinned = useVal(getStudio().atomP.ahistoric.pinOutline) ?? true
  const detailsPinned = useVal(getStudio().atomP.ahistoric.pinDetails) ?? true

  const {moreMenu, moreMenuTriggerRef} = useMoreMenu()

  const showUpdatesBadge = useShouldShowUpdatesBadge()

  const {hasNotifications} = useNotifications()

  const [notificationsTooltip, notificationsTriggerRef] =
    useEmptyNotificationsTooltip()

  return (
    <Container>
      <SubContainer>
        <LeftStrip />
      </SubContainer>
      {outlineTriggerTooltip}
      <SubContainer>
        {/* <PinButton
          ref={outlineTriggerRef as $IntentionalAny}
          data-testid="OutlinePanel-TriggerButton"
          onClick={() => {
            const prev = val(getStudio().atomP.ahistoric.pinOutline)
            getStudio().transaction(({stateEditors}) => {
              stateEditors.studio.ahistoric.setPinOutline(!(prev ?? true))
            })
          }}
          icon={<Outline />}
          pinHintIcon={<DoubleChevronRight />}
          unpinHintIcon={<DoubleChevronLeft />}
          pinned={outlinePinned}
        /> */}
        {/* <AuthState /> */}
        {conflicts.length > 0 ? (
          <NumberOfConflictsIndicator>
            {conflicts.length}
          </NumberOfConflictsIndicator>
        ) : null}
        <ExtensionToolbar showLeftDivider toolbarId="global" />
      </SubContainer>
      <SubContainer>
        <RightStrip />
        {/* 
        {notificationsTooltip}
        <PinButton
          ref={notificationsTriggerRef as $IntentionalAny}
          onClick={() => {
            const prev = val(getStudio().atomP.ahistoric.pinNotifications)
            getStudio().transaction(({stateEditors}) => {
              stateEditors.studio.ahistoric.setPinNotifications(
                !(prev ?? false),
              )
            })
          }}
          icon={<Bell />}
          pinHintIcon={<Bell />}
          unpinHintIcon={<Bell />}
          pinned={useVal(getStudio().atomP.ahistoric.pinNotifications) ?? false}
        >
          {hasNotifications && <HasUpdatesBadge type="warning" />}
        </PinButton> */}
        {/* {moreMenu.node}
        <ToolbarIconButton
          ref={moreMenuTriggerRef}
          onClick={(e) => {
            moreMenu.toggle(e, moreMenuTriggerRef.current!)
          }}
        >
          <Ellipsis />
          {showUpdatesBadge && <HasUpdatesBadge type="info" />}
        </ToolbarIconButton> */}
        {/* <PinButton
          ref={outlineTriggerRef as $IntentionalAny}
          onClick={() => {
            const prev = val(getStudio().atomP.ahistoric.pinDetails)
            getStudio().transaction(({stateEditors}) => {
              stateEditors.studio.ahistoric.setPinDetails(!(prev ?? true))
            })
          }}
          icon={<Details />}
          pinHintIcon={<DoubleChevronLeft />}
          unpinHintIcon={<DoubleChevronRight />}
          pinned={detailsPinned}
        /> */}
      </SubContainer>
    </Container>
  )
}

export default GlobalToolbar
