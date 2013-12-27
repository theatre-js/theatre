SeekBarModel = require './editorModel/SeekBarModel'
StructureModel = require './editorModel/StructureModel'
ListManagerModel = require './editorModel/ListManagerModel'
DynamicTimeFlow = require './DynamicTimeFlow'

module.exports = class EditorModel

	constructor: (@id = 'timeFlow') ->

		@timeFlow = new DynamicTimeFlow

		@structure = new StructureModel @

		@lists = new ListManagerModel @

		@seekBar = new SeekBarModel @