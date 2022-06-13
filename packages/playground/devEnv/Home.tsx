import React from 'react'
import styled, {StyleSheetManager} from 'styled-components'

const PreviewContainer = styled.div`
  --previewHeight: 450px;
  --previewWidth: 800px;
  --previewScale: 0.3;
  position: relative;
  overflow: hidden;
  height: calc(var(--previewHeight) * var(--previewScale));
  width: calc(var(--previewWidth) * var(--previewScale));

  &::after {
    content: '';
    position: absolute;
    display: block;
    z-index: 1;
    background: rgba(0, 0, 0, 0.001);
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

const HomeContainer = styled.div`
  padding: 1rem 2rem;

  ul {
    display: flex;
    gap: 1rem;

    li {
      display: inline-flex;
      padding: 1rem;
      border: 1px solid rgba(50, 50, 50, 0.2);
    }
  }
`

export const Home = ({groups}: {groups: {[groupName: string]: string[]}}) => (
  <StyleSheetManager disableVendorPrefixes>
    <HomeContainer>
      <h1>Theatre.js Playground</h1>
      {Object.entries(groups).map(([groupName, modules]) => (
        <section key={`li-${groupName}`}>
          <h2>{groupName}</h2>
          <Group
            key={`group-${groupName}`}
            groupName={groupName}
            modules={modules}
          />
        </section>
      ))}
    </HomeContainer>
  </StyleSheetManager>
)

const HomeItem = styled.a`
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  text-decoration: none;

  display: flex;
  flex-direction: column;

  .desc {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 8px 12px;
    gap: 4px;

    h3 {
      font-size: 15px;
      font-weight: bold;
      color: #ffffffcc;
      line-height: 1.2;
      margin: 0;
    }

    p {
      margin: 0;
      font-weight: 400;
      font-size: 13px;
      line-height: 16px;
      /* identical to box height, or 123% */
      /* White/White60 */
      color: rgba(255, 255, 255, 0.6);
    }
  }
`

const Group = (props: {groupName: string; modules: string[]}) => {
  let {groupName, modules} = props
  return (
    <ul>
      {modules.map((moduleName) => {
        const href = `/${groupName}/${moduleName}`
        return (
          <li key={`li-${moduleName}`}>
            <HomeItem href={href}>
              <PreviewContainer>
                <iframe src={href} frameBorder="0"></iframe>
              </PreviewContainer>
              <div className="desc">
                <h3>{moduleName}</h3>
                <p>{href}</p>
              </div>
            </HomeItem>
          </li>
        )
      })}
    </ul>
  )
}
