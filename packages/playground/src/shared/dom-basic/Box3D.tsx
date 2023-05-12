import React, {useEffect, useRef} from 'react'
import type {CSSProperties} from 'react'
import {types} from '@theatre/core'
import type {ISheet} from '@theatre/core'

// Box element
export const BoxSize = 100

const Box3DCSS: CSSProperties = {
  border: '1px solid #999',
  position: 'absolute',
  width: `${BoxSize}px`,
  height: `${BoxSize}px`,
}

const Box3DTextCSS: CSSProperties = {
  margin: '0',
  padding: '0',
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  textAlign: 'center',
  width: '100%',
}

export const Box3D: React.FC<{
  sheet: ISheet
  name: string
  x: number
  y: number
}> = ({sheet, name, x, y}) => {
  const elementRef = useRef<HTMLDivElement>(null)

  // Animation
  useEffect(() => {
    const element = elementRef.current!
    const sheetObj = sheet.object(`Box - ${name}`, {
      background: types.rgba({r: 16 / 255, g: 16 / 255, b: 16 / 255, a: 1}),
      opacity: types.number(1, {range: [0, 1]}),
      position: {
        x: x,
        y: y,
        z: 0,
      },
      rotation: {
        x: types.number(0, {range: [-360, 360]}),
        y: types.number(0, {range: [-360, 360]}),
        z: types.number(0, {range: [-360, 360]}),
      },
      scale: {
        x: 1,
        y: 1,
        z: 1,
      },
    })
    const unsubscribe = sheetObj.onValuesChange((values: any) => {
      const {background, opacity, position, rotation, scale} = values
      element.style.backgroundColor = `rgba(${background.r * 255}, ${
        background.g * 255
      }, ${background.b * 255}, 1)`
      element.style.opacity = opacity
      const translate3D = `translate3d(${position.x}px, ${position.y}px, ${position.z}px)`
      const rotate3D = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`
      const scale3D = `scaleX(${scale.x}) scaleY(${scale.y}) scaleZ(${scale.z})`
      const transform = `${scale3D} ${translate3D} ${rotate3D}`
      element.style.transform = transform
    })
    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <div ref={elementRef} style={Box3DCSS}>
      <span style={Box3DTextCSS}>{name}</span>
    </div>
  )
}
