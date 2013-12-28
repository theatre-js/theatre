module.exports = class WorkspaceButtonsView

	constructor: (@timeline) ->

		@clicks = @timeline.editor.clicks

		do @_prepareNode
		do @_prepareShowGraphButton
		do @_prepareActiveWorkspaceButton

	_prepareNode: ->

		@node = document.createElement 'div'
		@node.classList.add 'timeflow-workspaceButtons'

		@timeline.node.appendChild @node

		return

	_prepareShowGraphButton: ->

		@showGraphButton = document.createElement 'div'
		@showGraphButton.classList.add 'timeflow-workspaceButtons-showGraph'

		@node.appendChild @showGraphButton

		graph = @timeline.editor.graph

		@clicks.onClick @showGraphButton, =>

			graph.show()

		return

	_prepareActiveWorkspaceButton: ->

		workspaces = @timeline.editor.model.workspaces

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