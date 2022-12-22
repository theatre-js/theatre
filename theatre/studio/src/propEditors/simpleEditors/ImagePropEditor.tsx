import type {PropTypeConfig_Image} from '@theatre/core/propTypes'
import React, {useCallback, useEffect} from 'react'
import styled from 'styled-components'
import type {ISimplePropEditorReactProps} from './ISimplePropEditorReactProps'

const Wrapper = styled.label`
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  ${({empty}) => empty && `border: 1px dashed currentColor;`}
  box-sizing: border-box;
`

// file input
const Input = styled.input.attrs({type: 'file', accept: 'image/*'})`
  display: none;
`

const Preview = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const Placeholder = styled.span``

function ImagePropEditor({
  propConfig,
  editingTools,
  value,
  autoFocus,
}: ISimplePropEditorReactProps<PropTypeConfig_Image>) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)

  useEffect(() => {
    if (value) {
      setPreviewUrl(editingTools.getAssetUrl(value))
    } else {
      setPreviewUrl(null)
    }
  }, [value])

  const onChange = useCallback(
    async (event) => {
      const file = event.target.files[0]
      editingTools.permanentlySetValue('')
      const imageId = await editingTools.createAsset(file)
      if (!imageId) {
        editingTools.permanentlySetValue(value)
      } else {
        editingTools.permanentlySetValue(imageId)
      }
      event.target.value = null
    },
    [editingTools],
  )

  return (
    <Wrapper empty={!previewUrl}>
      <Input
        type="file"
        onChange={onChange}
        accept="image/*"
        autoFocus={autoFocus}
      />
      {previewUrl ? (
        <Preview src={previewUrl} />
      ) : (
        <Placeholder>No image</Placeholder>
      )}
    </Wrapper>
  )
}

export default ImagePropEditor
