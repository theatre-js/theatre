PacsTimeline = require './prop/PacsTimeline'

module.exports = class _Prop

	constructor: (@timeFlow, @name, @arrayName, @arrayIndex, @initial = 0) ->

		@id = @timeFlow.id + '-' + @name

		@array = @timeFlow._arrays[@arrayName]

		@_processedTimeline = []

		@pacs = new PacsTimeline @

	_reportUpdate: (from, to) ->