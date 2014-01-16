Pacs = require './prop/Pacs'
_DynamicModel = require '../_DynamicModel'

module.exports = class Prop extends _DynamicModel

	constructor: (@timeline, @id, @arrayName, @arrayIndex) ->

		@rootModel = @timeline.rootModel

		@_serializedAddress = ['timeline', '_allProps', @id]

		super

		@array = @timeline._arrays[@arrayName]

		@initial = @array[@arrayIndex]

		@pacs = new Pacs @

		@_chronology = @pacs.chronology

		@_nextIndexToCheck = 0

		@_incrementalIsolates = []

	serialize: ->

		se = pacs: @pacs.serialize()

		se

	_loadFrom: (se) ->

		@pacs.loadFrom se.pacs

		return

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

	_set: (val) ->

		@array[@arrayIndex] = val

		return

	get: ->

		@array[@arrayIndex]

	_reportUpdate: (from, to) ->

		do @_reportLocalChange

		for ic in @_incrementalIsolates

			ic._reportUpdate from, to

		@_nextIndexToCheck = 0

	_tickForward: (t) ->

		item = @_chronology[@_nextIndexToCheck]

		return if not item? or item.t > t

		nextIndex = @_nextIndexToCheck + 1

		while (nextItem = @_chronology[nextIndex]) and nextItem?

			break if nextItem.t > t

			item = nextItem

			@_nextIndexToCheck = nextIndex

			nextIndex++

		if item.isPoint()

			@_nextIndexToCheck++

		@_set item.tickAt t

		return

	_tickBackward: (t) ->

		item = @_chronology[@_nextIndexToCheck]

		return @_tickForward(t) if item? and item.t <= t

		indexToCheck = @_nextIndexToCheck

		loop

			indexToCheck--

			item = @_chronology[indexToCheck]

			unless item?

				@_nextIndexToCheck = 0

				@_set @initial

				return

			if item.t < t

				@_set item.tickAt t

				@_nextIndexToCheck = indexToCheck

				if item.isPoint()

					@_nextIndexToCheck++

				return

		return
