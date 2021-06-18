import type {ComponentProps, VFC} from 'react'
import React, {forwardRef} from 'react'
import type {DialogProps} from 'reakit'
import {Dialog, DialogBackdrop, useDialogState} from 'reakit'

// we are abstracting away stuff like baseId because we are not going to use DialogDisclosure
export type ModalProps = Pick<DialogProps, 'children' | 'visible' | 'hide'>

export const Modal: VFC<ModalProps> = ({children, ...props}) => {
  const dialog = {...useDialogState(), ...props}

  return (
    <DialogBackdrop
      // @ts-ignore
      {...dialog}
      className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-start"
    >
      <Dialog
        // @ts-ignore
        {...dialog}
        className="flex flex-col my-14 max-w-md w-full bg-white rounded-md shadow-lg focus:outline-none"
        aria-label="Dialog"
      >
        {children}
      </Dialog>
    </DialogBackdrop>
  )
}

export const useModal = () => {
  const {show, hide, visible} = useDialogState()

  return {show, hide, visible}
}

export type ModalHeaderProps = ComponentProps<'header'>

export const ModalHeader = forwardRef<HTMLElement, ModalHeaderProps>(
  ({className, ...props}, ref) => {
    return (
      <header
        ref={ref}
        {...props}
        className={`${className} flex-0 px-6 py-4 text-xl font-semibold`}
      />
    )
  },
)

export type ModalBodyProps = ComponentProps<'div'>

export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  ({className, ...props}, ref) => {
    return (
      <div ref={ref} {...props} className={`${className} flex-1 px-6 py-2`} />
    )
  },
)

export type ModalFooterProps = ComponentProps<'footer'>

export const ModalFooter = forwardRef<HTMLElement, ModalFooterProps>(
  ({className, ...props}, ref) => {
    return (
      <footer
        ref={ref}
        {...props}
        className={`${className} flex px-6 py-4 justify-end gap-3`}
      />
    )
  },
)
