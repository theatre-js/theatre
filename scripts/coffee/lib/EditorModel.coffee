GraphModel = require './editorModel/GraphModel'
MainBoxModel = require './editorModel/MainBoxModel'
TimeControlModel = require './editorModel/TimeControlModel'
WorkspaceManagerModel = require './editorModel/WorkspaceManagerModel'
TimelineModel = require './editorModel/TimelineModel'

module.exports = class EditorModel

	constructor: (@id = 'timeFlow', @timeFlow) ->

		@graph = new GraphModel @

		@mainBox = new MainBoxModel @

		@workspaces = new WorkspaceManagerModel @

		@timeControl = new TimeControlModel @

		@timeline = new TimelineModel @

	_tick: (t) ->

		@timeControl._tick t

	serialize: ->

		se = {}

		se.id = @id

		se.timeFlow = @timeFlow.serialize()

		se.timeControl = @timeControl.serialize()

		se.mainBox = @mainBox.serialize()

		se.workspaces = @workspaces.serialize()

		se.timeline = @timeline.serialize()

		se

	loadFrom: (se) ->

		@timeFlow.loadFrom se.timeFlow

		# @timeControl.loadFrom se.timeControl

		# @mainBox.loadFrom se.mainBox

		# @workspaces.loadFrom se.workspaces

		# @timeline.loadFrom se.timeline

		@