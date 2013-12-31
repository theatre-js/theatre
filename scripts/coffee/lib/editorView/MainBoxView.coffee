WorkspaceButtonsView = require './mainBoxView/WorkspaceButtonsView'
WorkspaceListView = require './mainBoxView/WorkspaceListView'
TimelineView = require './mainBoxView/TimelineView'
SeekbarView = require './mainBoxView/SeekbarView'
_Emitter = require '../_Emitter'

module.exports = class MainBoxView extends _Emitter

	constructor: (@editor) ->

		super

		@model = @editor.model.mainBox

		do @_prepareNode

		do @_recalculateSpace

		window.addEventListener 'resize', => do @_recalculateSpace

		@seekbar = new SeekbarView @

		@workspaceList = new WorkspaceListView @

		@workspaceButtons = new WorkspaceButtonsView @

		@timeline = new TimelineView @

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

	_recalculateSpace: ->

		@width = window.innerWidth - 8

		@_emit 'width-change'

	show: ->