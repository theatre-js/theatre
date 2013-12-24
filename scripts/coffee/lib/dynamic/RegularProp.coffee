PacTimeline = require 'prop/PacTimeline'

module.exports = class RegularProp

	constructor: (@timeFlow, @name, @arrayName, @arrayIndex, @initial = 0) ->

		@array = @timeFlow._arrays[@arrayName]

		@_processedTimeline = []

		@pacs = new PacTimeline

