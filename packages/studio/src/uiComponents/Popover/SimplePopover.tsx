import React, {useContext} from 'react'
import BasicPopover from './BasicPopover'
import {mergeRefs} from 'react-merge-refs'
import {createPortal} from 'react-dom'
import {PortalContext} from 'reakit'
import type {PopoverPositionerProps} from './PopoverPositioner'
import PopoverPositioner from './PopoverPositioner'

type Props = {
  className?: string
  children: React.ReactNode
  isOpen?: boolean
} & Omit<PopoverPositionerProps, 'children'>

const SimplePopover = React.forwardRef<{}, Props>((props, ref) => {
  const portalLayer = useContext(PortalContext)

  if (!portalLayer) {
    return <></>
  }

  return props.isOpen !== false ? (
    createPortal(
      <PopoverPositioner
        children={() => <BasicPopover ref={mergeRefs([ref])} {...props} />}
        target={props.target}
        onClickOutside={props.onClickOutside}
        onPointerOutside={props.onPointerOutside}
        constraints={props.constraints}
        verticalGap={props.verticalGap}
      />,
      portalLayer!,
    )
  ) : (
    <></>
  )
})

export default SimplePopover
