import React, {memo} from 'react'
import Base from './Base'
import Handle from './Handle'
import FillStrip from './FillStrip'

const PlaybackRange = memo(() => {
  return (
    <>
      <Base />
      <FillStrip />
      <Handle which="from" />
      <Handle which="to" />
    </>
  )
})

export default PlaybackRange