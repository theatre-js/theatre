import {
  BsCameraVideoFill,
  BsFillCollectionFill,
  BsCloudFill,
} from 'react-icons/bs'
import {GiCube, GiLightBulb, GiLightProjector} from 'react-icons/gi'
import {BiSun} from 'react-icons/bi'
import React from 'react'
import type {IconID} from '@theatre/r3f'
export type {IconID} from '@theatre/r3f'

const icons: {[P in IconID]: JSX.Element} = {
  collection: <BsFillCollectionFill />,
  cube: <GiCube />,
  lightBulb: <GiLightBulb />,
  spotLight: <GiLightProjector />,
  sun: <BiSun />,
  camera: <BsCameraVideoFill />,
  cloud: <BsCloudFill />,
}

export default icons
