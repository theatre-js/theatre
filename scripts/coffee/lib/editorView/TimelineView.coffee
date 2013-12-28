WorkspaceButtonsView = require './timelineView/WorkspaceButtonsView'
WorkspaceListView = require './timelineView/WorkspaceListView'

module.exports = class TimelineView

	constructor: (@editorView) ->

		@timelineModel = @editorView.editorModel.timeline

		do @_prepare

		@workspaceListView = new WorkspaceListView @

		@workspaceButtonsView = new WorkspaceButtonsView @

	_prepare: ->

		@node = document.createElement 'div'
		@node.classList.add 'timeflow-timeline'
		@editorView.node.appendChild @node

		if @timelineModel.isVisible()

			do @show

		@timelineModel.on 'visibility-change', =>

			if @timelineModel.isVisible()

				do @show

			else

				do @hide

			return

	show: ->