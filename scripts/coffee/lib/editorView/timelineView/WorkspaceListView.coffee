Foxie = require 'foxie'

module.exports = class WorkspaceListView

	constructor: (@timeline) ->

		@clicks = @timeline.editor.clicks

		@keys = @timeline.editor.keys

		@node = Foxie('.timeflow-workspaceList').putIn(@timeline.node)

		@holder = Foxie('.timeflow-workspaceList-holder').putIn(@node)

		@model = @timeline.editor.model.workspaces

		window.model = @model

		@model.on 'new-workspace', (ws) =>

			@_recognizeNewWorkspace ws


		@_initRename()

		@_initNewBtn()

	_recognizeNewWorkspace: (ws) ->

		wsNode = new Foxie('.timeflow-workspaceList-workspace').putIn(@holder)

		wsNode.node.innerText = ws.name

		@clicks.onClick wsNode, (e) =>

			if e.ctrlKey

				@_startEdit wsNode, =>

					ws.rename wsNode.node.innerText

				return

			ws.activate()

	_initRename: ->

		@currentEdit = no

		@keys.on 'enter', null, (e) =>

			@_storeEdit()

	_startEdit: (wsNode, cb) ->

		@currentEditCallBack = cb

		@currentEdit = wsNode.node

		@currentEdit.contentEditable = yes

		@currentEdit.focus()

	_storeEdit: ->

		if @currentEdit

			@currentEdit.contentEditable = no

			@currentEdit = no

			@currentEditCallBack()

	_initNewBtn: ->

		@newBtn = Foxie('.timeflow-workspaceList-workspace').putIn(@node)

		@newBtn.node.innerText = '+'

		@clicks.onClick @newBtn, =>

			@newBtn.node.innerText = ''

			@_startEdit @newBtn, =>

				if @newBtn.node.innerText isnt ''

					@model.get(@newBtn.node.innerText)

				@newBtn.node.innerText = '+'

	show: ->

		return if @showing

		@node.node.classList.add 'show'

		@showing = yes

		@clicks.onModalClosure @node.node, =>

			do @hide

	hide: ->

		if @showing

			@_storeEdit()

			@node.node.classList.remove 'show'

			@showing = no