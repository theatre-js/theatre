Foxie = require 'foxie'

module.exports = class WorkspaceButtonsView

	constructor: (@mainBox) ->

		@moosh = @mainBox.editor.moosh

		@wsList = @mainBox.workspaceList

		@wsList.on 'show', =>

			@node.addClass 'visible'

		@wsList.on 'hide', =>

			@node.removeClass 'visible'

		do @_prepareNode
		do @_prepareShowGraphButton
		do @_prepareActiveWorkspaceButton

	_prepareNode: ->

		@node = Foxie('.timeflow-workspaceButtons').putIn @mainBox.node

		return

	_prepareShowGraphButton: ->

		@showGraphButton = Foxie('.timeflow-workspaceButtons-showGraph')
		.putIn(@node)

		graph = @mainBox.editor.graph

		@moosh.onClick(@showGraphButton)
		.onDone =>

			graph.show()

		return

	_prepareActiveWorkspaceButton: ->

		workspaces = @mainBox.editor.model.workspaces

		activeWsName = Foxie('span.timeflow-workspaceButtons-activeWorkspaceName')
		.innerHTML(workspaces.getActiveWorkspace().name)
		.putIn(@node)

		workspaces.on 'active-workspace-change', =>

			activeWsName.innerHTML workspaces.getActiveWorkspace().name


		@moosh.onClick(activeWsName)
		.onDone =>

			@wsList.show()

		return