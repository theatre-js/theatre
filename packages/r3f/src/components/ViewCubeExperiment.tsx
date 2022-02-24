import type {FC} from 'react'
import React, {useEffect, useRef} from 'react'
import type {ISheetObject} from '@theatre/core'
import studio from '@theatre/studio'

export interface ViewCubeExperimentProps {
  cameraSheetObject: ISheetObject<{
    transform: {
      position: {
        x: number
        y: number
        z: number
      }
      target: {
        x: number
        y: number
        z: number
      }
    }
  }>
}

export const ViewCubeExperiment: FC<ViewCubeExperimentProps> = ({
  cameraSheetObject,
}) => {
  const textRef = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    const setFromTheatre = (
      props: ViewCubeExperimentProps['cameraSheetObject']['value'],
    ) => {
      textRef.current.innerText = props.transform.position.x.toString()
    }

    const unsub = cameraSheetObject.onValuesChange(setFromTheatre)
    setFromTheatre(cameraSheetObject.value)

    return unsub
  })

  return (
    <div>
      <div ref={textRef} />
      <button
        onClick={() => {
          studio.transaction((api) => {
            api.set(
              cameraSheetObject.props.transform.position.x,
              cameraSheetObject.value.transform.position.x + 1,
            )
          })
        }}
      >
        hello
      </button>
    </div>
  )
}
