import type {PropTypeConfig_Image} from '@theatre/core/propTypes'
import usePopover from '@theatre/studio/uiComponents/Popover/usePopover'
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import styled from 'styled-components'
import type {ISimplePropEditorReactProps} from './ISimplePropEditorReactProps'
import {popoverBackgroundColor} from '@theatre/studio/uiComponents/Popover/BasicPopover'
import type {$FixMe} from '@theatre/shared/utils/types'
import {
  Trash,
  ArrowClockwise,
  AddImage,
} from '@theatre/studio/uiComponents/icons'

const Wrapper = styled.div`
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

const FileInputLabel = styled.label`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 8px;
  width: 200px;
  height: 200px;
  background-color: #333;
  border-radius: 3px;
`

const Preview = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const Placeholder = styled.span``

const ImagePickerPopover = styled.div`
  position: absolute;
  display: grid;
  grid-template-columns: repeat(3, 200px);
  gap: 4px;
  background-color: ${popoverBackgroundColor};
  color: white;
  margin: 0;
  cursor: default;
  border-radius: 3px;
  z-index: 10000;
  backdrop-filter: blur(8px);
  max-height: 420px;
  overflow-y: auto;

  padding: 8px;
  pointer-events: all;

  border: none;
  box-shadow: none;
`

const ImageContainer = styled.div<{selected?: boolean}>`
  overflow: hidden;
  border-radius: 2px;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    display: ${({selected}) => (selected ? 'block' : 'none')};
    inset: 0;
    border-bottom: 4px solid #40aaa4;
  }

  > img {
    display: block;
  }
`

const OptionContainer = styled.div`
  position: relative;
`

const EditingRow = styled.div`
  position: absolute;
  display: none;
  gap: 4px;
  z-index: 1;
  top: 4px;
  right: 4px;

  ${OptionContainer}:hover & {
    display: flex;
  }
`

const EditButton = styled.button<{danger?: boolean}>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  width: 32px;
  height: 32px;
  outline: none;
  box-sizing: border-box;

  color: #a8a8a9;

  background: rgba(40, 43, 47, 0.8);
  backdrop-filter: blur(14px);
  border: none;
  border-radius: 2px;

  svg {
    display: block;
  }

  &:hover {
    background: ${({danger}) => (danger ? '#d00' : 'rgba(59, 63, 69, 0.8)')};
    color: white;
  }

  &:active {
    background: rgba(82, 88, 96, 0.8);
  }

  @supports not (backdrop-filter: blur()) {
    background: rgba(40, 43, 47, 0.95);
  }
`

function ImagePropEditor({
  propConfig,
  editingTools,
  value,
  autoFocus,
}: ISimplePropEditorReactProps<PropTypeConfig_Image>) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(value)

  const containerRef = useRef<HTMLDivElement>(null!)

  const getImages = useCallback(
    () =>
      Object.fromEntries(
        editingTools
          .getAssetIDs('image')
          .map((id) => [id, editingTools.getAssetUrl(id)]),
      ),
    [editingTools],
  )

  const [images, setImages] = useState(getImages())

  useEffect(() => {
    try {
      setPreviewUrl(editingTools.getAssetUrl(value))
    } catch {
      setPreviewUrl(null)
    }
  }, [value])

  const popover = usePopover(
    {
      closeWhenPointerIsDistant: false,
      debugName: 'ImageAssetPicker',
    },
    () => (
      <ImagePickerPopover>
        <FileInputLabel>
          <Input type="file" onChange={onChange} accept="image/*" />
          <AddImage width={50} height={50} />
          Add image asset
        </FileInputLabel>
        {Object.entries(images).map(([id, url]) => (
          <OptionContainer>
            <ImageContainer
              selected={value === id}
              onClick={() => editingTools.permanentlySetValue(id)}
            >
              <img src={url} width={200} height={200} />
            </ImageContainer>
            <EditingRow>
              <EditButton as="label">
                <Input onChange={updateOnChange(id)} />
                <ArrowClockwise />
              </EditButton>
              <EditButton
                danger={true}
                onClick={() => {
                  editingTools.deleteAsset(id)
                  setImages(getImages())
                }}
              >
                <Trash />
              </EditButton>
            </EditingRow>
          </OptionContainer>
        ))}
      </ImagePickerPopover>
    ),
  )

  useLayoutEffect(() => {
    popover.open({clientX: 0, clientY: 0}, containerRef.current)
  }, [])

  const onChange = useCallback(
    async (event) => {
      const file = event.target.files[0]

      const imageId = await editingTools.createAsset(file)

      event.target.value = null
      setImages(getImages())
    },
    [editingTools],
  )

  const updateOnChange = useCallback(
    (id: string) => async (event: $FixMe) => {
      const file = event.target.files[0]

      const imageId = await editingTools.updateAsset(id, file)

      setImages(getImages())
    },
    [editingTools],
  )

  return (
    <>
      <Wrapper
        empty={!previewUrl}
        ref={containerRef}
        onClick={(e) => popover.toggle(e, containerRef.current)}
      >
        {previewUrl ? (
          <Preview src={previewUrl} />
        ) : (
          <Placeholder>No image</Placeholder>
        )}
      </Wrapper>
      {popover.node}
    </>
  )
}

export default ImagePropEditor
