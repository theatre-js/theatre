// @flow
import React from 'react'
import css from './index.css'

type Props = {
  data: {
    name: string,
    isExpanded: boolean,
  },
  children: Object,
  path: Array<string>,
  toggleExpansion: Function,
}

const Node = (props: Props) => {
  const {data: {name, isExpanded}, children, path, toggleExpansion} = props
  const hasChildren = (children != null)
  return (
    <div className={css.container}>
      {hasChildren &&
        <div
          className={css.expandButton}
          onClick={() => toggleExpansion(path)}>
          {isExpanded ? '-' : '+'}
        </div>
      }
      <div className={css.name}>
        {name}
      </div>
      {isExpanded && hasChildren &&
        <div className={css.subNodes}>
          {Object.keys(children).map((key) =>
            <Node
              key={key}
              toggleExpansion={toggleExpansion}
              {...children[key]} />
          )}
        </div>
      }
    </div>
  )
}

export default Node