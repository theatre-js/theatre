export const panelZIndexes = {
  get outlinePanel() {
    return 1
  },

  get propsPanel() {
    return panelZIndexes.outlinePanel
  },

  get sequenceEditorPanel() {
    return this.outlinePanel - 1
  },

  get toolbar() {
    return this.outlinePanel + 1
  },

  get pluginPanes() {
    return this.sequenceEditorPanel - 1
  },
}
