/**
 * A super basic Turtle geometry renderer hooked up to Theatre, so the parameters
 * can be tweaked and animated.
 */
import {getProject, types} from '@theatre/core'
import studio from '@theatre/studio'
import React, {useEffect, useState} from 'react'
import {render} from 'react-dom'
import styled from 'styled-components'

studio.initialize()
const project = getProject('Image type playground', {
  assetManager: {
    getAssetUrl: (assetId) =>
      assetId === 'yolo'
        ? 'https://www.mejorinfluencer.com/wp-content/uploads/2021/01/Yolo-Wiki-Youtuber-Espa%C3%B1a.png'
        : 'https://static.wikia.nocookie.net/disney/images/3/31/Profile_-_Boo.png/revision/latest?cb=20190313094050',
    createAsset: (asset) => {
      console.log('createAsset', asset)
      return 'yolo'
    },
  },
})
const sheet = project.sheet('Image type')

const Wrapper = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`

const ImageTypeExample: React.FC<{}> = (props) => {
  const [imageUrl, setImageUrl] = useState()

  useEffect(() => {
    const object = sheet.object('image', {
      image: types.image({
        label: 'texture',
      }),
    })
    object.onValuesChange(({image}) => {
      console.log('hello', image)
      try {
        setImageUrl(project.getAssetUrl(image))
      } catch (e) {}
    })

    return () => {
      sheet.detachObject('canvas')
    }
  }, [])

  return (
    <Wrapper>
      <img src={imageUrl} />
    </Wrapper>
  )
}

project.ready.then(() => {
  render(<ImageTypeExample />, document.getElementById('root'))
})
