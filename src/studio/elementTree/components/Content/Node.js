// @flow
import React from 'react'
import cx from 'classnames'
import css from './Node.css'
import {type Path} from '$studio/elementTree/types'

type Props = {
  data: {
    name: string,
  },
  isExpanded: boolean,
  children: Object,
  path: Path,
  toggleExpansion: Function,
  selectNode: Function,
  selectedNodePath: Path,
}

const Node = (props: Props) => {
  const {data: {name}, isExpanded, selectedNodePath, children, path, toggleExpansion, selectNode} = props
  const hasChildren = (children != null)
  const nameClasses = cx(css.name, {
    [css.selected]: (selectedNodePath === path),
  })
  return (
    <div className={css.container}>
      {hasChildren &&
        <div
          className={css.expandButton}
          onClick={() => toggleExpansion(path)}>
          {isExpanded ? '-' : '+'}
        </div>
      }
      <div
        className={nameClasses}
        onClick={() => selectNode(path)}>
        {name}
      </div>
      {isExpanded && hasChildren &&
        <div className={css.subNodes}>
          {Object.keys(children).map((key) =>
            <Node
              key={key}
              toggleExpansion={toggleExpansion}
              selectNode={selectNode}
              selectedNodePath={selectedNodePath}
              {...children[key]} />
          )}
        </div>
      }
    </div>
  )
}

export default Node