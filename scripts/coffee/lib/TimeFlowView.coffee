DynamicTimeFlow = require './DynamicTimeFlow'
Structure = require './view/Structure'
ListManager = require './view/ListManager'

module.exports = class TimeFlowView

	constructor: (@id = 'timeFlow') ->

		@timeFlow = new DynamicTimeFlow

		@structure = new Structure @

		@lists = new ListManager @