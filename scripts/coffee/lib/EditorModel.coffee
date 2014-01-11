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