// @flow
import React from 'react'

type Props = {
  children: React$Element<*>,
  css: Object,
  dragStartHandler: Function,
  dragEnterHandler: Function,
  dragLeaveHandler: Function,
  dragOverHandler: Function,
  dropHandler: Function,
}

const Dropzone = (props: Props) => {
  return (
    <div
      className={props.css}
      onDragStart={props.dragStartHandler}
      onDragEnter={props.dragEnterHandler}
      onDragLeave={props.dragLeaveHandler}
      onDragOver={props.dragOverHandler}
      onDrop={props.dropHandler}>
      {props.children}
    </div>
  )
}

export default Dropzone
