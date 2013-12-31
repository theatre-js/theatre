module.exports = class WorkspaceButtonsView

	constructor: (@mainBox) ->

		@clicks = @mainBox.editor.clicks

		do @_prepareNode
		do @_prepareShowGraphButton
		do @_prepareActiveWorkspaceButton

	_prepareNode: ->

		@node = document.createElement 'div'
		@node.classList.add 'timeflow-workspaceButtons'

		@mainBox.node.appendChild @node

		return

	_prepareShowGraphButton: ->

		@showGraphButton = document.createElement 'div'
		@showGraphButton.classList.add 'timeflow-workspaceButtons-showGraph'

		@node.appendChild @showGraphButton

		graph = @mainBox.editor.graph

		@clicks.onClick @showGraphButton, =>

			graph.show()

		return

	_prepareActiveWorkspaceButton: ->

		workspaces = @mainBox.editor.model.workspaces

		activeWsName = document.createElement 'span'
		activeWsName.classList.add 'timeflow-workspaceButtons-activeWorkspaceName'

		activeWsName.innerHTML = workspaces.getActiveWorkspace().name

		@node.appendChild activeWsName

		workspaces.on 'active-workspace-change', =>

			activeWsName.innerHTML = workspaces.getActiveWorkspace().name

		wsList = @mainBox.workspaceList

		@clicks.onClick activeWsName, =>

			wsList.show()

		return