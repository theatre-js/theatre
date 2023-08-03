import {PlaygroundPage} from './home/PlaygroundPage'
import ReactDom from 'react-dom/client'
import React from 'react'

// like [{'./shared/hello/index.html': () => import('./shared/hello/index.html')}]
const modules: Record<string, () => Promise<unknown>> = (
  import.meta as any
).glob('./(shared|personal|tests)/*/index.html')

const groups = (Object.keys(modules) as string[]).reduce((acc, path) => {
  const [_, groupName, moduleName] = path.split('/')
  if (!acc[groupName]) {
    acc[groupName] = []
  }
  acc[groupName].push(moduleName)
  return acc
}, {} as {[groupName: string]: string[]})

ReactDom.createRoot(document.getElementById('root')!).render(
  <PlaygroundPage groups={groups} />,
)
