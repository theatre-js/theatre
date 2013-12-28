GraphModel = require './editorModel/GraphModel'
TimelineModel = require './editorModel/TimelineModel'
DynamicTimeFlow = require './DynamicTimeFlow'
TimeControlModel = require './editorModel/TimeControlModel'
WorkspaceManagerModel = require './editorModel/WorkspaceManagerModel'

module.exports = class EditorModel

	constructor: (@id = 'timeFlow') ->

		@timeFlow = new DynamicTimeFlow

		@graph = new GraphModel @

		@timeline = new TimelineModel @

		@workspaces = new WorkspaceManagerModel @

		@timeControl = new TimeControlModel @

	_tick: (t) ->

		@timeControl._tick t