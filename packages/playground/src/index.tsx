/**
 * TODO explain this file
 * */
/// <reference types="vite/client" />

import type {$FixMe} from '@theatre/shared/utils/types'
import {mapKeys} from 'lodash-es'
import React from 'react'
import ReactDOM from 'react-dom'

const groups = {
  shared: mapKeys(import.meta.glob('./shared/*/index.tsx'), (_, path) =>
    pathToModuleName(path),
  ),
  personal: mapKeys(import.meta.glob('./personal/*/index.tsx'), (_, path) =>
    pathToModuleName(path),
  ),
  tests: mapKeys(import.meta.glob('./tests/*/index.tsx'), (_, path) =>
    pathToModuleName(path),
  ),
}

function pathToModuleName(path: string): string {
  const matches = path.match(
    /^\.\/(shared|personal|tests)\/([a-zA-Z0-9\-\s]+)\/index\.tsx$/,
  )

  if (!matches) {
    throw new Error(
      `module ${path} has invalid characters in its path. Valid names should match the regexp above this line.`,
    )
  }

  return matches[2]
}

const Home = () => (
  <ul>
    {Object.entries(groups).map(([groupName, modules]) => (
      <li key={`li-${groupName}`}>
        <span>{groupName}</span>
        <Group
          key={`group-${groupName}`}
          groupName={groupName}
          modules={modules}
        />
      </li>
    ))}
  </ul>
)

const Group = (props: {groupName: string; modules: Record<string, $FixMe>}) => {
  const {groupName, modules} = props
  return (
    <ul>
      {Object.entries(modules).map(([moduleName, callback]) => (
        <li key={`li-${moduleName}`}>
          <a href={`/${groupName}/${moduleName}`}>{moduleName}</a>
          {/* <Group key={`group-${group}`} modules={modules} /> */}
        </li>
      ))}
    </ul>
  )
}

const currentPathname = document.location.pathname

if (currentPathname === '/') {
  renderHome()
} else {
  const parts = currentPathname.match(
    /^\/(shared|personal|tests)\/([a-zA-Z0-9\-]+)$/,
  )
  if (parts) {
    const [, groupName, moduleName] = parts
    const group = groups[groupName as 'shared' | 'personal']
    if (!group) {
      throw new Error(`Unknown group ${groupName}`)
    }
    const module = group[moduleName]
    if (!module) {
      throw new Error(`Unknown module ${moduleName}`)
    }
    module()
  } else {
    throw new Error(`Unknown path ${currentPathname}`)
  }
}

function renderHome() {
  ReactDOM.render(React.createElement(Home), document.getElementById('root'))
}
