TimelineModel = require './editorModel/TimelineModel'
GraphModel = require './editorModel/GraphModel'
WorkspaceManagerModel = require './editorModel/WorkspaceManagerModel'
DynamicTimeFlow = require './DynamicTimeFlow'

module.exports = class EditorModel

	constructor: (@id = 'timeFlow') ->

		@timeFlow = new DynamicTimeFlow

		@graph = new GraphModel @

		@workspaces = new WorkspaceManagerModel @

		@timeline = new TimelineModel @