WorkspaceButtonsView = require './timelineView/WorkspaceButtonsView'
WorkspaceListView = require './timelineView/WorkspaceListView'
SeekBarView = require './timelineView/SeekBarView'

module.exports = class TimelineView

	constructor: (@editor) ->

		@timelineModel = @editor.editorModel.timeline

		do @_prepareNode

		@seekbar = new SeekBarView @

		@workspaceList = new WorkspaceListView @

		@workspaceButtons = new WorkspaceButtonsView @

	_prepareNode: ->

		@node = document.createElement 'div'
		@node.classList.add 'timeflow-timeline'
		@editor.node.appendChild @node

		if @timelineModel.isVisible()

			do @show

		@timelineModel.on 'visibility-change', =>

			if @timelineModel.isVisible()

				do @show

			else

				do @hide

			return

	show: ->