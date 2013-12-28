WorkspaceButtonsView = require './timelineView/WorkspaceButtonsView'
WorkspaceListView = require './timelineView/WorkspaceListView'
SeekbarView = require './timelineView/SeekbarView'

module.exports = class TimelineView

	constructor: (@editor) ->

		@timelineModel = @editor.model.timeline

		do @_prepareNode

		@seekbar = new SeekbarView @

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