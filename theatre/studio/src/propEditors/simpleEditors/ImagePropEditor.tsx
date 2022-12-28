import type {PropTypeConfig_Image} from '@theatre/core/propTypes'
import {Trash} from '@theatre/studio/uiComponents/icons'
import React, {useCallback, useEffect} from 'react'
import styled from 'styled-components'
import type {ISimplePropEditorReactProps} from './ISimplePropEditorReactProps'

const Container = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 2px;
`

const Group = styled.div<{empty: boolean}>`
  box-sizing: border-box;
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  overflow: hidden;
  ${({empty}) =>
    empty
      ? `border: 1px dashed rgba(255, 255, 255, 0.2)`
      : `border: 1px solid rgba(255, 255, 255, 0.05)`}
`

const InputLabel = styled.label`
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  color: #919191;
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

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;

  color: #a8a8a9;
  background: rgba(255, 255, 255, 0.1);

  border: none;
  height: 100%;
  aspect-ratio: 1/1;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`

function ImagePropEditor({
  propConfig,
  editingTools,
  value,
  autoFocus,
}: ISimplePropEditorReactProps<PropTypeConfig_Image>) {
  const [previewUrl, setPreviewUrl] = React.useState<string>()

  useEffect(() => {
    if (value) {
      setPreviewUrl(editingTools.getAssetUrl(value))
    } else {
      setPreviewUrl(undefined)
    }
  }, [value])

  const onChange = useCallback(
    async (event) => {
      const file = event.target.files[0]
      editingTools.permanentlySetValue({type: 'image', id: undefined})
      const imageId = await editingTools.createAsset(file)

      if (!imageId) {
        editingTools.permanentlySetValue(value)
      } else {
        editingTools.permanentlySetValue({
          type: 'image',
          id: imageId,
        })
      }
      event.target.value = null
    },
    [editingTools, value],
  )

  return (
    <Container>
      <Group empty={!value}>
        <InputLabel>
          <Input
            type="file"
            onChange={onChange}
            accept="image/*"
            autoFocus={autoFocus}
          />
          {previewUrl ? <Preview src={previewUrl} /> : <span>Add image</span>}
        </InputLabel>
        {value && (
          <DeleteButton
            onClick={() => {
              editingTools.permanentlySetValue({type: 'image', id: undefined})
            }}
          >
            <Trash />
          </DeleteButton>
        )}
      </Group>
    </Container>
  )
}

export default ImagePropEditor
