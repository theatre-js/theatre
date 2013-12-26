DynamicTimeFlow = require './DynamicTimeFlow'
Structure = require './view/Structure'

module.exports = class TimeFlowView

	constructor: (@id = 'timeFlow') ->

		@timeFlow = new DynamicTimeFlow

		@structure = new Structure @