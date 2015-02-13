Foxie = require 'foxie'

module.exports = class WorkspaceButtonsView

	constructor: (@mainBox) ->

		@rootView = @mainBox.rootView

		@wsList = @mainBox.workspaceList

		@wsList.on 'show', =>

			@node.addClass 'visible'

		@wsList.on 'hide', =>

			@node.removeClass 'visible'

		do @_prepareNode
		do @_prepareShowGraphButton
		do @_prepareActiveWorkspaceButton

	_prepareNode: ->

		@node = Foxie('.theatrejs-workspaceButtons').putIn @mainBox.node

		return

	_prepareShowGraphButton: ->

		@showGraphButton = Foxie('.theatrejs-workspaceButtons-showGraph')
		.putIn(@node)

		graph = @mainBox.editor.graph

		@rootView.moosh.onClick(@showGraphButton)
		.onDone =>

			graph.show()

		return

	_prepareActiveWorkspaceButton: ->

		workspaces = @mainBox.editor.model.workspaces

		activeWsName = Foxie('span.theatrejs-workspaceButtons-activeWorkspaceName')
		.innerHTML(workspaces.getActiveWorkspace().name)
		.putIn(@node)

		workspaces.on 'active-workspace-change', =>

			activeWsName.innerHTML workspaces.getActiveWorkspace().name


		@rootView.moosh.onClick(activeWsName)
		.onDone =>

			@wsList.show()

		return