import React from 'react'
import * as css from './RoomToClick.css'

interface IProps {
  room: number
}

const RoomToClick = (props: IProps) => {
  const style: $IntentionalAny = {'--room': props.room + 'px'}

  return <div className={css.roomToClick} style={style} />
}

export default RoomToClick
