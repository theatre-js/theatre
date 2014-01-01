Foxie = require 'foxie'

module.exports = class WorkspaceListView

	constructor: (@mainBox) ->

		@clicks = @mainBox.editor.clicks

		@keys = @mainBox.editor.keys

		@node = Foxie('.timeflow-workspaceList').putIn(@mainBox.node)

		@holder = Foxie('.timeflow-workspaceList-holder').putIn(@node)

		@model = @mainBox.editor.model.workspaces

		window.model = @model

		@model.on 'new-workspace', (ws) =>

			@_recognizeNewWorkspace ws

		do @_initRename

		do @_initNewBtn

	_recognizeNewWorkspace: (ws) ->

		wsNode = new Foxie('.timeflow-workspaceList-workspace').putIn(@holder)

		wsNode.node.innerText = ws.name

		ws.on 'remove', =>

			wsNode.remove()

		@clicks.onClick wsNode, (e) =>

			if e.ctrlKey

				@_startEdit wsNode, =>

					if wsNode.node.innerText is '' or wsNode.node.innerText is ' '

						ws.remove()

					else

						ws.rename wsNode.node.innerText

				, =>

					wsNode.node.innerText = ws.name

				return

			ws.activate()

	_initRename: ->

		@currentEdit = no

		@keys.on 'enter', null, (e) =>

			@_storeEdit()

		@keys.on 'esc', null, (e) =>

			@_discardEdit()

		@keys.on 'delete', {ctrl: true}, (e) =>

			@currentEdit.innerText = ''

			@_storeEdit()

	_startEdit: (wsNode, cb, discard) ->

		@currentEditCallBack = cb

		@currentEditDiscardCallBack = discard

		@currentEdit = wsNode.node

		@currentText = @currentEdit.innerText

		@currentEdit.contentEditable = yes

		@currentEdit.classList.add 'editing'

		@currentEdit.focus()

	_storeEdit: ->

		if @currentEdit

			@currentEdit.contentEditable = no

			@currentEdit.classList.remove 'editing'

			@currentEdit = no

			if @currentEditCallBack

				@currentEditCallBack()

				@currentEditCallBack = null

	_discardEdit: ->

		if @currentEdit

			@currentEdit.contentEditable = no

			@currentEdit.classList.remove 'editing'

			@currentEdit = no

			if @currentEditDiscardCallBack

				@currentEditDiscardCallBack()

				@currentEditDiscardCallBack = null

	_initNewBtn: ->

		@newBtn = Foxie('.timeflow-workspaceList-workspace').putIn(@node)

		@newBtn.node.innerText = '+'

		@clicks.onClick @newBtn, =>

			@newBtn.node.innerText = ''

			@_startEdit @newBtn, =>

				if @newBtn.node.innerText isnt ''

					@model.get(@newBtn.node.innerText)

				@newBtn.node.innerText = '+'

			, =>

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