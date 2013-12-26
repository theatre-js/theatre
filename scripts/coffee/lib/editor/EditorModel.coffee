SeekBar = require './model/SeekBar'
Structure = require './model/Structure'
ListManager = require './model/ListManager'
DynamicTimeFlow = require '../DynamicTimeFlow'

module.exports = class EditorModel

	constructor: (@id = 'timeFlow') ->

		@timeFlow = new DynamicTimeFlow

		@structure = new Structure @

		@lists = new ListManager @

		@seekBar = new SeekBar @