SeekBarModel = require './editorModel/SeekBarModel'
TimelineModel = require './editorModel/TimelineModel'
StructureModel = require './editorModel/StructureModel'
WorkspaceManagerModel = require './editorModel/WorkspaceManagerModel'
DynamicTimeFlow = require './DynamicTimeFlow'

module.exports = class EditorModel

	constructor: (@id = 'timeFlow') ->

		@timeFlow = new DynamicTimeFlow

		@structure = new StructureModel @

		@workspaces = new WorkspaceManagerModel @

		@seekBar = new SeekBarModel @

		@timeline = new TimelineModel @