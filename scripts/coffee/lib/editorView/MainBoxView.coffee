WorkspaceButtonsView = require './mainBoxView/WorkspaceButtonsView'
WorkspaceListView = require './mainBoxView/WorkspaceListView'
TimelineView = require './mainBoxView/TimelineView'
SeekbarView = require './mainBoxView/SeekbarView'
_Emitter = require '../_Emitter'
Foxie = require 'foxie'

module.exports = class MainBoxView extends _Emitter

	constructor: (@editor) ->

		super

		@rootView = @editor

		@model = @editor.model.mainBox

		do @_prepareNode

		do @_recalculateSpace

		window.addEventListener 'resize', => do @_recalculateSpace

		@timeline = new TimelineView @

		@seekbar = new SeekbarView @

		@workspaceList = new WorkspaceListView @

		@workspaceButtons = new WorkspaceButtonsView @

		do @_resizeNode

		@model.on 'height-change', => do @_resizeNode

	_prepareNode: ->

		@node = Foxie('.timeflow-mainBox').putIn(@editor.node)

		@nodeResizeHandle = Foxie('.timeflow-mainBox-resizeHandle')
		.putIn(@node)

		@rootView.moosh.onDrag(@nodeResizeHandle)
		.onDrag (e) =>

			@model.setHeight @model.height - e.relY

		if @model.isVisible()

			do @show

		@model.on 'visibility-change', =>

			if @model.isVisible()

				do @show

			else

				do @hide

			return

	_resizeNode: ->

		@node.css 'height', @model.height + 'px'

		return

	_recalculateSpace: ->

		newWidth = window.innerWidth - 8

		return if newWidth is @width

		@width = newWidth

		@_emit 'width-change'

	show: ->