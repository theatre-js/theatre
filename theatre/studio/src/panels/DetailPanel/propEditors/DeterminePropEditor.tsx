import type {
  PropTypeConfig,
  PropTypeConfig_AllSimples,
} from '@theatre/core/propTypes'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type {Pointer} from '@theatre/dataverse'
import React from 'react'
import BooleanPropEditor from './BooleanPropEditor'
import DetailCompoundPropEditor from './DetailCompoundPropEditor'
import NumberPropEditor from './NumberPropEditor'
import StringLiteralPropEditor from './StringLiteralPropEditor'
import StringPropEditor from './StringPropEditor'
import RgbaPropEditor from './RgbaPropEditor'
import type {ISimplePropEditorVFC} from './utils/IPropEditorFC'
import DetailSimplePropEditor from './DetailSimplePropEditor'
import {getPropTypeByPointer} from './getPropTypeByPointer'
import type {IEditingTools} from './utils/IEditingTools'
import KeyframeSimplePropEditor from './KeyframeSimplePropEditor'
import styled from 'styled-components'

type PropConfigByType<K extends PropTypeConfig['type']> = Extract<
  PropTypeConfig,
  {type: K}
>

type ISimplePropEditorByPropType = {
  [K in PropTypeConfig_AllSimples['type']]: ISimplePropEditorVFC<
    PropConfigByType<K>
  >
}

const simplePropEditorByPropType: ISimplePropEditorByPropType = {
  number: NumberPropEditor,
  string: StringPropEditor,
  boolean: BooleanPropEditor,
  stringLiteral: StringLiteralPropEditor,
  rgba: RgbaPropEditor,
}

type IDetailEditablePropertyProps<K extends PropTypeConfig['type']> = {
  obj: SheetObject
  pointerToProp: Pointer<PropConfigByType<K>['valueType']>
  propConfig: PropConfigByType<K>
}

type IDetailDeterminePropEditorProps<K extends PropTypeConfig['type']> =
  IDetailEditablePropertyProps<K> & {
    visualIndentation: number
  }

type IKeyframeDeterminePropEditorProps<K extends PropTypeConfig['type']> = {
  editingTools: IEditingTools<PropConfigByType<K>['valueType']>
  propConfig: PropConfigByType<K>
  keyframeValue: PropConfigByType<K>['valueType']
  displayLabel?: string
}

export const DetailDeterminePropEditor: React.VFC<
  IDetailDeterminePropEditorProps<PropTypeConfig['type']>
> = (p) => {
  const propConfig =
    p.propConfig ?? getPropTypeByPointer(p.pointerToProp, p.obj)

  if (propConfig.type === 'compound') {
    return (
      <DetailCompoundPropEditor
        obj={p.obj}
        visualIndentation={p.visualIndentation}
        pointerToProp={p.pointerToProp}
        propConfig={propConfig}
      />
    )
  } else if (propConfig.type === 'enum') {
    // hmm: document how enum gets put into ui (through label?)
    return <></>
  } else {
    const PropEditor = simplePropEditorByPropType[propConfig.type]

    return (
      <DetailSimplePropEditor
        SimpleEditorComponent={PropEditor}
        obj={p.obj}
        visualIndentation={p.visualIndentation}
        pointerToProp={p.pointerToProp}
        propConfig={propConfig}
      />
    )
  }
}

const KeyframePropEditorContainer = styled.div`
  padding: 2px;
  display: flex;
  align-items: stretch;

  select {
    min-width: 100px;
  }
`

const KeyframePropLabel = styled.span`
  font-style: normal;
  font-weight: 400;
  font-size: 11px;
  line-height: 13px;
  letter-spacing: 0.01em;
  margin-right: 12px;
  padding: 8px;

  color: #919191;
`

export const KeyframeDeterminePropEditor: React.VFC<
  IKeyframeDeterminePropEditorProps<PropTypeConfig['type']>
> = (p) => {
  const propConfig = p.propConfig

  if (propConfig.type === 'compound') {
    throw new Error(
      'We do not yet support editing compound props for a keyframe',
    )
  } else if (propConfig.type === 'enum') {
    // hmm: document how enum gets put into ui (through label?)
    return <></>
  } else {
    const PropEditor = simplePropEditorByPropType[propConfig.type]

    return (
      <KeyframePropEditorContainer>
        <KeyframePropLabel>{p.displayLabel}</KeyframePropLabel>
        <KeyframeSimplePropEditor
          SimpleEditorComponent={PropEditor}
          propConfig={propConfig}
          editingTools={p.editingTools}
          keyframeValue={p.keyframeValue}
        />
      </KeyframePropEditorContainer>
    )
  }
}
