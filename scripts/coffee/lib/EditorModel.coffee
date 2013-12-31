GraphModel = require './editorModel/GraphModel'
MainBoxModel = require './editorModel/MainBoxModel'
DynamicTimeFlow = require './DynamicTimeFlow'
TimeControlModel = require './editorModel/TimeControlModel'
WorkspaceManagerModel = require './editorModel/WorkspaceManagerModel'

module.exports = class EditorModel

	constructor: (@id = 'timeFlow') ->

		@timeFlow = new DynamicTimeFlow

		@graph = new GraphModel @

		@mainBox = new MainBoxModel @

		@workspaces = new WorkspaceManagerModel @

		@timeControl = new TimeControlModel @

	_tick: (t) ->

		@timeControl._tick t