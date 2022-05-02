import {BsCameraVideoFill, BsFillCollectionFill} from 'react-icons/bs'
import {GiCube, GiLightBulb, GiLightProjector} from 'react-icons/gi'
import {BiSun} from 'react-icons/bi'
import type {ReactNode} from 'react';
import React from 'react'
import type {IconID} from './editableFactoryConfigUtils'

const icons: {
  [Key in IconID]: ReactNode
} = {
  collection: <BsFillCollectionFill />,
  cube: <GiCube />,
  lightBulb: <GiLightBulb />,
  spotLight: <GiLightProjector />,
  sun: <BiSun />,
  camera: <BsCameraVideoFill pointerEvents="none" />,
}

export default icons
