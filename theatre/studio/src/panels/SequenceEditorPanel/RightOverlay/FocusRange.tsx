import React from 'react'
import {usePrism} from '@theatre/react'
import {val} from '@theatre/dataverse'

const FocusRange: React.FC<IProps> = ({layoutP, className}) => {
  return usePrism(() => {
    const sheet = val(layoutP.sheet)
    const sequence = sheet.getSequence()
    const sequenceLength = sequence.length
    const startInUnitSpace = sequenceLength

    let width = val(layoutP.clippedSpace.fromUnitSpace)(startInUnitSpace)

    return <div className={className} style={{width: `${width}px`}}></div>
  }, [layoutP])
}

export default FocusRange
