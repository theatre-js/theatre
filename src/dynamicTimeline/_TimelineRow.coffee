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

	_reportIneffectiveChange: ->

		do @_reportLocalChange

	_reportChange: (from, to) ->

		do @_reportLocalChange

		@_emit 'change'

		for ic in @_incrementalIsolates

			ic._reportChange from, to

		@_nextIndexToCheck = 0