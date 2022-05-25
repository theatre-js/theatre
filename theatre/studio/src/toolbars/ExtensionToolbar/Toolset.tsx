import didYouMean from '@theatre/shared/utils/didYouMean'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import userReadableTypeOfValue from '@theatre/shared/utils/userReadableTypeOfValue'
import type {ToolConfig, ToolsetConfig} from '@theatre/studio/TheatreStudio'
import React from 'react'
import IconButton from './tools/IconButton'
import Switch from './tools/Switch'

const Toolset: React.FC<{
  config: ToolsetConfig
}> = (props) => {
  return (
    <>
      {props.config.map((toolConfig, i) => {
        return <Tool config={toolConfig} key={i} />
      })}
    </>
  )
}

const toolByType: {
  [Key in ToolConfig['type']]: React.FC<{
    config: Extract<ToolConfig, {type: Key}>
  }>
} = {
  Icon: IconButton,
  Switch: Switch,
}

function getToolByType<Type extends ToolConfig['type']>(
  type: Type,
): React.FC<{config: Extract<ToolConfig, {type: Type}>}> {
  return toolByType[type] as $IntentionalAny
}

const Tool: React.FC<{config: ToolConfig}> = ({config}) => {
  const Comp = getToolByType(config.type)

  if (!Comp) {
    throw new Error(
      `No tool with tool.type ${userReadableTypeOfValue(
        config.type,
      )} exists. Did you mean ${didYouMean(
        config.type,
        Object.keys(toolByType),
      )}`,
    )
  }

  return <Comp config={config} />
}

export default Toolset
