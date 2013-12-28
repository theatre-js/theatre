module.exports = class WorkspaceListView

	constructor: (@timelineView) ->

		@clicks = @timelineView.editorView.clicks

		@node = document.createElement 'div'
		@node.classList.add 'timeflow-workspaceList'

		@timelineView.node.appendChild @node