import React from 'react'
import styled, {StyleSheetManager} from 'styled-components'
import {ItemSectionWithPreviews} from './ItemSectionWithPreviews'
import {PlaygroundHeader} from './PlaygroundHeader'

const HomeContainer = styled.div`
  position: fixed;
  inset: 0;
  background: #1b1c1e;
`
const ContentContainer = styled.div`
  padding: 0 5rem;

  @media screen and (max-width: 920px) {
    padding: 0 2rem;
  }
`

const version = require('../../../../theatre/studio/package.json').version

const PageTitleH1 = styled.h1`
  padding: 1rem 0;
`

export const PlaygroundPage = ({
  groups,
}: {
  groups: {[groupName: string]: string[]}
}) => (
  <StyleSheetManager disableVendorPrefixes>
    <HomeContainer>
      <PlaygroundHeader
        version={{
          displayText: version,
        }}
        links={[
          {
            label: 'Getting Started',
            href: 'https://docs.theatrejs.com/getting-started/',
          },
          {
            label: 'Docs',
            href: 'https://docs.theatrejs.com/',
          },
          {
            label: 'API',
            href: 'https://docs.theatrejs.com/api/',
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
          />
        ))}
      </ContentContainer>
    </HomeContainer>
  </StyleSheetManager>
)
