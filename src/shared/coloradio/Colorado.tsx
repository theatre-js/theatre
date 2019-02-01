import React from 'react'

interface IProps {

}

type IColor = {
  type: 'Absolute',
  inHex: string
} | {
  type: 'Reference',
  address: string
}

type IPalette = {
  colors: Record<IColor>
}

interface IState {
  palettesById: Record<string, IPalette>
}

export default class Colorado extends React.Component {
  constructor(props: IProps) {
    super(props)

  }
  render() {
    return 'hi'
  }
}
