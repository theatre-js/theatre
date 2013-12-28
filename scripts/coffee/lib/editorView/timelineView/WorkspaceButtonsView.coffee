module.exports = class WorkspaceButtonsView

	constructor: (@timeline) ->

		@clicks = @timeline.editor.clicks

		do @_prepareNode
		do @_prepareShowStructureButton
		do @_prepareActiveWorkspaceButton

	_prepareNode: ->

		@node = document.createElement 'div'
		@node.classList.add 'timeflow-workspaceButtons'

		@timeline.node.appendChild @node

		return

	_prepareShowStructureButton: ->

		@showStructureButton = document.createElement 'div'
		@showStructureButton.classList.add 'timeflow-workspaceButtons-showStructure'

		@node.appendChild @showStructureButton

		structure = @timeline.editor.structure

		@clicks.onClick @showStructureButton, =>

			structure.show()

		return

	_prepareActiveWorkspaceButton: ->

		workspaces = @timeline.editor.editorModel.workspaces

		activeWsName = document.createElement 'span'
		activeWsName.classList.add 'timeflow-workspaceButtons-activeWorkspaceName'

		activeWsName.innerHTML = workspaces.getActiveWorkspace().name

		@node.appendChild activeWsName

		workspaces.on 'active-workspace-change', =>

			activeWsName.innerHTML = workspaces.getActiveWorkspace().name

		wsList = @timeline.workspaceList

		@clicks.onClick activeWsName, =>

			wsList.show()

		return