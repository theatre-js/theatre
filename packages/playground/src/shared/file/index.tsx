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

const FileTypeExample: React.FC<{}> = (props) => {
  const [fileUrl, setFileUrl] = useState<string>()

  useEffect(() => {
    const object = sheet.object('File holder', {
      f: types.file('', {
        label: 'The OBJ',
      }),
    })
    object.onValuesChange(({f}) => {
      setFileUrl(project.getAssetUrl(f))
    })

    return () => {
      sheet.detachObject('canvas')
    }
  }, [])

  return <Wrapper>File url is: {fileUrl}</Wrapper>
}

project.ready
  .then(() => {
    ReactDom.createRoot(document.getElementById('root')!).render(
      <FileTypeExample />,
    )
  })
  .catch((err) => {
    console.error(err)
  })
