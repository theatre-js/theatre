/**
 * A super basic Turtle geometry renderer hooked up to Theatre, so the parameters
 * can be tweaked and animated.
 */
import {getProject, types} from '@theatre/core'
import studio from '@theatre/studio'
import React, {useEffect, useState} from 'react'
import ReactDom from 'react-dom/client'
import styled from 'styled-components'

const project = getProject('Image type playground', {
  assets: {
    baseUrl: '/',
  },
})
studio.initialize()
const sheet = project.sheet('Image type')

const Wrapper = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`

const ImageTypeExample: React.FC<{}> = (props) => {
  const [imageUrl, setImageUrl] = useState<string>()

  useEffect(() => {
    const object = sheet.object('image', {
      image: types.image('', {
        label: 'texture',
      }),
      image2: types.image('', {
        label: 'another texture',
      }),
      // audio: types.__genericAsset(''),
      something: 'asdf',
      color: types.rgba(),
    })
    object.onValuesChange(({image}) => {
      setImageUrl(project.getAssetUrl(image))
    })

    return () => {
      sheet.detachObject('canvas')
    }
  }, [])

  return (
    <Wrapper
      onClick={() => {
        if (sheet.sequence.position === 0) {
          sheet.sequence.position = 0
          void sheet.sequence.play()
        } else {
          sheet.sequence.position = 0
        }
      }}
    >
      <img src={imageUrl} />
    </Wrapper>
  )
}

project.ready
  .then(() => {
    ReactDom.createRoot(document.getElementById('root')!).render(
      <ImageTypeExample />,
    )
  })
  .catch((err) => {
    console.error(err)
  })
