WorkspaceButtonsView = require './mainBoxView/WorkspaceButtonsView'
WorkspaceListView = require './mainBoxView/WorkspaceListView'
SeekbarView = require './mainBoxView/SeekbarView'

module.exports = class MainBoxView

	constructor: (@editor) ->

		@model = @editor.model.mainBox

		do @_prepareNode

		@seekbar = new SeekbarView @

		@workspaceList = new WorkspaceListView @

		@workspaceButtons = new WorkspaceButtonsView @

	_prepareNode: ->

		@node = document.createElement 'div'
		@node.classList.add 'timeflow-mainBox'
		@editor.node.appendChild @node

		if @model.isVisible()

			do @show

		@model.on 'visibility-change', =>

			if @model.isVisible()

				do @show

			else

				do @hide

			return

	show: ->