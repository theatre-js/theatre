import SetAttributeInspector from './HTML/SetAttribute/SetAttributeInspector/SetAttributeInspector'
import SetCustomStyleInspector from './HTML/SetCustomStyle/SetCustomStyleInspector/SetCustomStyleInspector'
import UberModifierInspector from './HTML/UberModifier/UberModifierInspector/UberModifierInspector'

const inspectorComponents = {
  'TheatreJS/Core/HTML/SetAttribute': SetAttributeInspector,
  'TheatreJS/Core/HTML/SetCustomStyle': SetCustomStyleInspector,
  'TheatreJS/Core/HTML/UberModifier': UberModifierInspector,
}

export type ModifierIDsWithInspectorComponents = keyof typeof inspectorComponents

export default inspectorComponents
