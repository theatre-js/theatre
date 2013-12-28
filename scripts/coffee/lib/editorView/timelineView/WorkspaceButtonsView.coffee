module.exports = class WorkspaceButtonsView

	constructor: (@timelineView) ->

		@clicks = @timelineView.editorView.clicks

		@node = document.createElement 'div'
		@node.classList.add 'timeflow-workspaceButtons'

		@timelineView.node.appendChild @node

		@showStructureButton = document.createElement 'div'
		@showStructureButton.classList.add 'timeflow-workspaceButtons-showStructure'

		@node.appendChild @showStructureButton

		structureView = @timelineView.editorView._structureView

		@clicks.onClick @showStructureButton, =>

			structureView.show()

		workspaces = @timelineView.editorView.editorModel.workspaces

		activeWsName = document.createElement 'span'
		activeWsName.classList.add 'timeflow-workspaceButtons-activeWorkspaceName'

		activeWsName.innerHTML = workspaces.getActiveWorkspace().name

		@node.appendChild activeWsName

		workspaces.on 'active-workspace-change', =>

			activeWsName.innerHTML = workspaces.getActiveWorkspace().name

		wsListView = @timelineView.workspaceListView

		@clicks.onClick activeWsName, =>

			wsListView.show()