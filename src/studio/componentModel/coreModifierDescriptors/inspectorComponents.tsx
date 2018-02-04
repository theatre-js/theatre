const inspectorComponents = {
  'TheaterJS/Core/HTML/SetAttribute': require('./HTML/SetAttribute/SetAttributeInspector')
    .default,
  'TheaterJS/Core/HTML/SetCustomStyle': require('./HTML/SetCustomStyle/SetCustomStyleInspector')
    .default,
  'TheaterJS/Core/HTML/UberModifier': require('./HTML/SetCustomStyle/UberModifierInspector')
    .default,
}

export default inspectorComponents
