import type {VFC} from 'react'
import React, {Suspense} from 'react'
import {Canvas} from '@react-three/fiber'
import {Environment, OrbitControls, TorusKnot} from '@react-three/drei'
import type {ClickableProps} from 'reakit'
import {Clickable} from 'reakit'
import {IoIosClose} from 'react-icons/all'

export interface EnvironmentPreviewProps extends ClickableProps {
  url: string | null
  selected: boolean
}

const EnvironmentPreview: VFC<EnvironmentPreviewProps> = ({
  url,
  selected,
  ...props
}) => {
  return (
    <Clickable
      {...props}
      as="div"
      className={`${
        selected
          ? 'ring-4 ring-green-800 hover:ring-green-900'
          : 'hover:ring-4 hover:ring-gray-200'
      } focus:outline-none focus:ring-4 rounded overflow-hidden`}
    >
      <div className="h-full relative">
        {url ? (
          <>
            <Canvas>
              <Suspense fallback={null}>
                {/* @ts-ignore */}
                <OrbitControls enableZoom={false} enablePan={false} />
                <Environment
                  // @ts-ignore
                  files={url}
                  path=""
                  background={true}
                />
              </Suspense>
              <TorusKnot>
                <meshStandardMaterial metalness={1} roughness={0} />
              </TorusKnot>
            </Canvas>
            <div className="absolute inset-1 pointer-events-none flex flex-col justify-end items-center">
              <div className="bg-white p-0.5 text-xxs rounded shadow">
                {url ?? 'None'}
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-full bg-gray-100">
            <IoIosClose size="3em" />
          </div>
        )}
      </div>
    </Clickable>
  )
}

export default EnvironmentPreview
