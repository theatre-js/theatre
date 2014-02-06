_DynamicModel = require '../_DynamicModel'

module.exports = class _TimelineRow extends _DynamicModel

	constructor: (@timeline, @id) ->

		@rootModel = @timeline.rootModel

		super

		@_incrementalIsolates = []

	attachToIncrementalIsolate: (id) ->

		isolate = @timeline.getIncrementalIsolate id

		unless isolate?

			throw Error "Couldn't find incremental isolate '#{id}'"

		if isolate in @_incrementalIsolates

			throw Error "Prop '#{@id}' is already attached to isolate '#{isolate.id}'"

		@_incrementalIsolates.push isolate

		@timeline._pluckFromRegularProps @

		isolate._addProp @

		@

	_reportIneffectiveUpdate: ->

		do @_reportLocalChange

	_reportUpdate: (from, to) ->

		do @_reportLocalChange

		for ic in @_incrementalIsolates

			ic._reportUpdate from, to

		@_nextIndexToCheck = 0