import type {VFC} from 'react'
import React from 'react'
import Highlight, {defaultProps} from 'prism-react-renderer'
import theme from 'prism-react-renderer/themes/github'

export interface CodeProps {
  children: string
  block?: boolean
}

const Code: VFC<CodeProps> = ({children, block}) => {
  return (
    <Highlight {...defaultProps} theme={theme} code={children} language="tsx">
      {({className, style, tokens, getLineProps, getTokenProps}) => (
        <code
          className={`${className} font-mono whitespace-pre rounded ${
            block ? 'block p-4' : 'inline p-1'
          }`}
          style={style}
        >
          {tokens.map((line, i) => (
            <div
              {...getLineProps({line, key: i})}
              className={block ? 'block' : 'inline'}
            >
              {line.map((token, key) => (
                <span {...getTokenProps({token, key})} />
              ))}
            </div>
          ))}
        </code>
      )}
    </Highlight>
  )
}
export default Code
