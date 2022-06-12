import React from 'react'

export const Home = ({groups}: {groups: {[groupName: string]: string[]}}) => (
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

const Group = (props: {groupName: string; modules: string[]}) => {
  const {groupName, modules} = props
  return (
    <ul>
      {modules.map((moduleName) => (
        <li key={`li-${moduleName}`}>
          <a href={`/${groupName}/${moduleName}`}>{moduleName}</a>
        </li>
      ))}
    </ul>
  )
}
