GraphModel = require './editorModel/GraphModel'
TimelineModel = require './editorModel/TimelineModel'
ControlsModel = require './editorModel/ControlsModel'
DynamicTimeFlow = require './DynamicTimeFlow'
WorkspaceManagerModel = require './editorModel/WorkspaceManagerModel'

module.exports = class EditorModel

	constructor: (@id = 'timeFlow') ->

		@timeFlow = new DynamicTimeFlow

		@graph = new GraphModel @

		@workspaces = new WorkspaceManagerModel @

		@timeline = new TimelineModel @

		@controls = new ControlsModel @

	_tick: (t) ->

		@controls._tick t