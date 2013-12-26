PacsTimeline = require './prop/PacsTimeline'

module.exports = class _Prop

	constructor: (@timeFlow, @name, @arrayName, @arrayIndex) ->

		@id = @timeFlow.id + '-' + @name

		@array = @timeFlow._arrays[@arrayName]

		@initial = @array[@arrayIndex]

		@_processedTimeline = []

		@pacs = new PacsTimeline @

	_reportUpdate: (from, to) ->