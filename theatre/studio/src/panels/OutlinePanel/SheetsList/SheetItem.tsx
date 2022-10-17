import type Project from '@theatre/core/projects/Project'

import {usePrism} from '@theatre/react'
import {val} from '@theatre/dataverse'
import React, {useState} from 'react'
import styled from 'styled-components'
import {SheetInstanceItem} from './SheetInstanceItem'
import getStudio from '@theatre/studio/getStudio'

const Head = styled.div`
  display: flex;
`

const Container = styled.li<{isSelected: boolean}>`
  color: ${(props) => (props.isSelected ? 'white' : 'hsl(1, 1%, 80%)')};
`

const Body = styled.div``

export const SheetItem: React.FC<{
  depth: number
  sheetId: string
  project: Project
}> = ({sheetId, depth, project}) => {
  let [counter, set] = useState(0)
  return usePrism(() => {
    const template = val(project.sheetTemplatesP[sheetId])
    if (!template) return <></>
    const allInstances = val(template.instancesP)

    return (
      <>
        {Object.entries(allInstances).map(([_, inst]) => (
          <div key={inst.address.sheetInstanceId}>
            {inst
              .getSequences()
              .map((s) => s.address.sequenceName)
              .join(' --- ')}

            <button
              onClick={() => {
                getStudio().transaction(({stateEditors}) =>
                  stateEditors.coreByProject.historic.sheetsById.sequences.swap(
                    inst.address,
                  ),
                )
                set(counter + 1)
              }}
            >
              SWAP
            </button>
            <button
              onClick={() => {
                const seqs = inst.getSequences()
                console.log('HI!', seqs)
                // seqs[0]
                //   .play()
                //   .then(console.log)
                //   .then(() => seqs[1].play())
                //   .then(console.log)

                inst
                  .getSequences()[0]
                  .play()
                  .then(() => {
                    getStudio().transaction(({stateEditors}) => {
                      stateEditors.coreByProject.historic.sheetsById.sequences.swap(
                        inst.address,
                      )
                      inst.getSequences()[0].play()
                    })
                  })
                set(counter + 1)
              }}
            >
              Play all
            </button>
            <SheetInstanceItem
              key={inst.address.sheetInstanceId}
              sheet={inst}
              depth={depth}
            />
          </div>
        ))}
      </>
    )
  }, [depth, sheetId, project, counter])
}
