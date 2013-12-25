PacsTimeline = require './prop/PacsTimeline'

module.exports = class RegularProp

	constructor: (@timeFlow, @name, @arrayName, @arrayIndex, @initial = 0) ->

		@array = @timeFlow._arrays[@arrayName]

		@_processedTimeline = []

		@pacs = new PacsTimeline @

	_reportUpdate: (from, to) ->