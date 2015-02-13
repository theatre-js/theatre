WorkspaceButtonsView = require './mainBoxView/WorkspaceButtonsView'
WorkspaceListView = require './mainBoxView/WorkspaceListView'
TimelineEditorView = require './mainBoxView/TimelineEditorView'
SeekbarView = require './mainBoxView/SeekbarView'
_Emitter = require '../_Emitter'
Foxie = require 'foxie'

module.exports = class MainBoxView extends _Emitter

	constructor: (@editor) ->

		super

		@rootView = @editor

		@model = @editor.model.mainBox

		do @_prepareNode

		@width = window.innerWidth - 8

		setTimeout @_recalculateSpace, 50

		window.addEventListener 'resize', @_recalculateSpace

		@timelineEditor = new TimelineEditorView @

		@seekbar = new SeekbarView @

		@workspaceList = new WorkspaceListView @

		@workspaceButtons = new WorkspaceButtonsView @

		do @_updateVertically

		@_visible = yes

		@model.on 'height-change', => do @_updateVertically

	_prepareNode: ->

		@node = Foxie('.theatrejs-mainBox')
		.moveZ(1)
		.putIn(@editor.node).trans(500)

		@nodeResizeHandle = Foxie('.theatrejs-mainBox-resizeHandle')
		.putIn(@node)

		@rootView.moosh.onDrag(@nodeResizeHandle)
		.onDrag (e) =>

			if @model.isVisible()

				@model.setHeight @model.height - e.relY

			return

		@rootView.moosh.onClick(@nodeResizeHandle)
		.repeatedBy(2)
		.onDone =>

			do @model.toggleVisibility

		@model.on 'visibility-toggle', =>

			do @_updateVisibility

			return

		@rootView.kilid.on('alt+enter')
		.onEnd =>

			do @model.toggleVisibility

	_updateVertically: ->

		@node.css('height', @model.height + 'px')

		do @_updateVisibility

		return

	_recalculateSpace: =>

		newWidth = @node.node.clientWidth - 8

		return if newWidth is @width

		@width = newWidth

		@_emit 'width-change'

	getCurrentHeight: ->

		@model.height - (if @model.isVisible() then 0 else @model.height - 21)

	_updateVisibility: ->

		return if @_visible is @model.isVisible()

		@_visible = @model.isVisible()

		if @_visible

			@editor.node.removeClass 'hidden'
			@node.moveYTo(0).setOpacity(1)

		else

			@editor.node.addClass 'hidden'
			@node.moveYTo(@model.height - 21)

		return