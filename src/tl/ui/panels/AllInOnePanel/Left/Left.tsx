import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import React from 'react'
import * as css from './Left.css'
import {val} from '$shared/DataVerse2/atom'
import Node from './Node'
import {AllInOnePanelStuff} from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'

const rootPath = '@@@@ROOT@@@@23907uaso;dlsld;kjfs;d298dlksjdlskaj932'
const classes = resolveCss(css)

export type NodeDescriptorsByPath = {
  [path: string]: NodeDescriptor
}

export type NodeDescriptor = {
  isObject: boolean
  path: string
  lastComponent: string
  children: string[]
}

interface IProps {}

interface IState {}

export default class Left extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  render() {
    return (
      <AllInOnePanelStuff>
        {allInOnePanelStuffP => {
          return (
            <PropsAsPointer>
              {() => {
                const timelineInstance = val(
                  allInOnePanelStuffP.timelineInstance,
                )
                const internalTimeline = val(
                  allInOnePanelStuffP.internalTimeline,
                )
                if (!timelineInstance || !internalTimeline) return null

                const internalObjects = val(
                  internalTimeline._internalObjects.pointer,
                )
                const allPaths = Object.keys(internalObjects)

                const root: NodeDescriptor = {
                  isObject: false,
                  path: '',
                  children: [],
                  lastComponent: rootPath,
                }

                const nodeDescriptorsByPath: NodeDescriptorsByPath = {
                  [rootPath]: root,
                }

                for (const path of allPaths) {
                  const pathComponents = path.split(/\s*\/\s*/)
                  let parent = root
                  for (let i = 0; i < pathComponents.length; i++) {
                    const pathSoFar = pathComponents.slice(0, i + 1).join(' / ')
                    if (!nodeDescriptorsByPath[pathSoFar]) {
                      nodeDescriptorsByPath[pathSoFar] = {
                        isObject: false,
                        path: pathSoFar,
                        children: [],
                        lastComponent: pathComponents[i],
                      }
                    }
                    const node = nodeDescriptorsByPath[pathSoFar]
                    const isLast = i === pathComponents.length - 1
                    if (isLast) {
                      node.isObject = true
                    }
                    if (parent.children.indexOf(pathSoFar) === -1)
                      parent.children.push(pathSoFar)
                    parent = node
                  }
                }

                return (
                  <div {...classes('container')}>
                    {root.children.map(childPath => {
                      return (
                        <Node
                          path={childPath}
                          key={'child: ' + childPath}
                          nodeDescriptorsByPath={nodeDescriptorsByPath}
                          depth={1}
                        />
                      )
                    })}
                  </div>
                )
              }}
            </PropsAsPointer>
          )
        }}
      </AllInOnePanelStuff>
    )
  }
}
