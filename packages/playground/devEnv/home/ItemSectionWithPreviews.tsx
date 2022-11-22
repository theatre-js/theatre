import React from 'react'
import styled from 'styled-components'

export const ItemSectionWithPreviews = (props: {
  groupName: string
  modules: string[]
}) => {
  let {groupName, modules} = props
  return (
    <section>
      <SectionHeader>{groupName}</SectionHeader>
      <ItemListContainer>
        {modules.map((moduleName) => {
          const href = `/${groupName}/${moduleName}`
          return (
            <ItemContainer key={`li-${moduleName}`}>
              <ItemLink href={href}>
                {/* <PreviewContainer>
                  <iframe src={href} frameBorder="0" tabIndex={-1} />
                </PreviewContainer> */}
                <ItemDesc>
                  <h3>{moduleName}</h3>
                  <p>{href}</p>
                </ItemDesc>
              </ItemLink>
            </ItemContainer>
          )
        })}
      </ItemListContainer>
    </section>
  )
}

const SectionHeader = styled.h3`
  font-family: 'Inter', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 19px;

  text-transform: capitalize;

  /* White/White50 */
  color: rgba(255, 255, 255, 0.5);
`

const ItemDesc = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px 12px;
  gap: 4px;

  & > h3 {
    margin: 0;

    font-family: 'Inter', sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 15px;
    line-height: 18px;

    /* White/White80 */
    color: rgba(255, 255, 255, 0.8);
  }

  & > p {
    margin: 0;
    font-weight: 400;
    font-size: 13px;
    line-height: 16px;
    /* identical to box height, or 123% */
    /* White/White60 */
    color: rgba(255, 255, 255, 0.6);
  }
`

const ItemContainer = styled.div`
  /* display: inline-flex; */
`

const ItemListContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;

  margin-bottom: 2rem;
`

const PreviewContainer = styled.div`
  --previewHeight: 450px;
  --previewWidth: 800px;
  --previewScale: 0.3;
  position: relative;
  overflow: hidden;
  height: calc(var(--previewHeight) * var(--previewScale));
  width: calc(var(--previewWidth) * var(--previewScale));

  /* Neutral/Neutral800 */
  background: rgba(33, 35, 39, 0.9);

  &::after {
    content: '';
    position: absolute;
    display: block;
    z-index: 1;
    top: 0;
    left: 0;
    height: calc(var(--previewHeight) * var(--previewScale));
    width: calc(var(--previewWidth) * var(--previewScale));
  }

  iframe {
    /* don't want original size of iframe affecting layout */
    position: absolute;
    transform-origin: top left;
    transform: scale(var(--previewScale));
    height: var(--previewHeight);
    width: var(--previewWidth);
  }
`
const ItemLink = styled.a`
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  text-decoration: none;
  overflow: hidden;

  display: flex;
  flex-direction: column;
`
