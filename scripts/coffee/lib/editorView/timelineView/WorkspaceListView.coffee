Foxie = require 'foxie'

module.exports = class WorkspaceListView

	constructor: (@timeline) ->

		@clicks = @timeline.editor.clicks

		@node = Foxie('.timeflow-workspaceList').putIn(@timeline.node)

		@model = @timeline.editor.model.workspaces

		window.model = @model

		@model.on 'new-workspace', (ws) =>

			@_recognizeNewWorkspace ws

	_recognizeNewWorkspace: (ws) ->

		wsNode = new Foxie('.timeflow-workspaceList-workspace').putIn(@node)

		wsNode.node.innerHTML = ws.name

		@clicks.onClick wsNode, =>

			ws.activate()

	show: ->

		console.log 'showing'