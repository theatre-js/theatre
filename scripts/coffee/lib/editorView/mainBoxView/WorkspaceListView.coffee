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

		@_attachCtrl wsNode.node

		ws.on 'remove', =>

			wsNode.remove()

		@clicks.onClick(wsNode)
		.withNoKeys()
		.onDone (e) =>

			console.log 'activate'

			ws.activate()

		@clicks.onClick(wsNode)
		.withKeys('ctrl')
		.onDone (e) =>

			console.log 'edit'

			@_startEdit wsNode, =>

				if wsNode.node.innerText is '' or wsNode.node.innerText is ' '

					ws.remove()

				else

					ws.rename wsNode.node.innerText

			, =>

				wsNode.node.innerText = ws.name

	_attachCtrl: (node) ->

		@clicks.onHover(node)
		.withKeys('ctrl')
		.onEnter =>

			node.classList.add 'pre-edit'

		.onLeave =>

			node.classList.remove 'pre-edit'

		return

	_initRename: ->

		@currentEdit = no

		# @keys 'enter', 'rename', (e) =>

		# 	@_storeEdit()

		# @keys 'esc', 'rename', (e) =>

		# 	@_discardEdit()

		# @keys 'ctrl+delete', 'rename', (e) =>

		# 	@currentEdit.innerText = ''

		# 	@_storeEdit()

	_startEdit: (wsNode, cb, discard) ->

		# @keys.setScope 'rename'

		@currentEditCallBack = cb

		@currentEditDiscardCallBack = discard

		@currentEdit = wsNode.node

		@currentText = @currentEdit.innerText

		@currentEdit.contentEditable = yes

		@currentEdit.classList.add 'editing'

		@currentEdit.focus()

	_storeEdit: ->

		if @currentEdit

			# @keys.setScope 'time'

			@currentEdit.contentEditable = no

			@currentEdit.classList.remove 'editing'

			@currentEdit = no

			if @currentEditCallBack

				@currentEditCallBack()

				@currentEditCallBack = null

	_discardEdit: ->

		if @currentEdit

			# @keys.setScope 'time'

			@currentEdit.contentEditable = no

			@currentEdit.classList.remove 'editing'

			@currentEdit = no

			if @currentEditDiscardCallBack

				@currentEditDiscardCallBack()

				@currentEditDiscardCallBack = null

	_initNewBtn: ->

		@newBtn = Foxie('.timeflow-workspaceList-workspace').putIn(@node)

		@newBtn.node.innerText = '+'

		@clicks.onClick(@newBtn)
		.onDone =>

			@newBtn.node.innerText = ''

			@_startEdit @newBtn, =>

				if @newBtn.node.innerText isnt ''

					@model.get(@newBtn.node.innerText)

				@newBtn.node.innerText = '+'

			, =>

				@newBtn.node.innerText = '+'

	show: ->

		return if @visible

		@node.addClass 'visible'

		@visible = yes

		@clicks.onClickOutside @node, =>

			do @hide

	hide: ->

		if @visible

			@_storeEdit()

			@node.removeClass 'visible'

			@visible = no

		return