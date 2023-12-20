import React from 'react'
import styled, {StyleSheetManager} from 'styled-components'
import {ItemSectionWithPreviews} from './ItemSectionWithPreviews'
import {PlaygroundHeader} from './PlaygroundHeader'
// @ts-ignore
import {version} from '../../../studio/package.json'

const HomeContainer = styled.div`
  position: fixed;
  inset: 0;
  background: #1b1c1e;
  overflow: auto;
`
const ContentContainer = styled.div`
  padding: 0 5rem;

  @media screen and (max-width: 920px) {
    padding: 0 2rem;
  }
`

// const {version} = require('')

const PageTitleH1 = styled.h1`
  padding: 1rem 0;
`

export const PlaygroundPage = ({
  groups,
}: {
  groups: {[groupName: string]: string[]}
}) => {
  return (
    <StyleSheetManager disableVendorPrefixes>
      <HomeContainer>
        <PlaygroundHeader
          version={{
            displayText: version,
          }}
          links={[
            {
              label: 'Docs',
              href: 'https://www.theatrejs.com/docs/latest',
            },
            {
              label: 'Github',
              href: 'https://github.com/theatre-js/theatre',
            },
          ]}
        />
        <ContentContainer>
          <PageTitleH1>Playground</PageTitleH1>
          {Object.entries(groups).map(([groupName, modules]) => (
            <ItemSectionWithPreviews
              key={`group-${groupName}`}
              groupName={groupName}
              modules={modules}
              collapsedByDefault={groupName === 'tests'}
              collapsible={groupName === 'tests'}
            />
          ))}
        </ContentContainer>
      </HomeContainer>
    </StyleSheetManager>
  )
}
