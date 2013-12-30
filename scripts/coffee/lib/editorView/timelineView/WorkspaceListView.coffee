Foxie = require 'foxie'

module.exports = class WorkspaceListView

	constructor: (@timeline) ->

		@clicks = @timeline.editor.clicks

		@keys = @timeline.editor.keys

		@node = Foxie('.timeflow-workspaceList').putIn(@timeline.node)

		@model = @timeline.editor.model.workspaces

		window.model = @model

		@model.on 'new-workspace', (ws) =>

			@_recognizeNewWorkspace ws

		@_initRename()

	_recognizeNewWorkspace: (ws) ->

		wsNode = new Foxie('.timeflow-workspaceList-workspace').putIn(@node)

		wsNode.node.innerText = ws.name

		@clicks.onClick wsNode, (e) =>

			if e.ctrlKey

				@currentEdit = wsNode.node

				@currentEdit.contentEditable = yes

				@currentEdit.focus()

				# newName = wsNode.node.innerHTML

				# ws.rename(newName)

				return

			ws.activate()

	_initRename: ->

		@currentEdit = no

		@keys.on 'enter', null, (e) =>

			if @currentEdit

				@currentEdit.contentEditable = no

				@currentEdit = no

	show: ->

		return if @showing

		@node.node.classList.add 'show'

		@showing = yes

		@clicks.onModalClosure @node.node, =>

			do @hide


	hide: ->

		if @showing

			@node.node.classList.remove 'show'

			@showing = no