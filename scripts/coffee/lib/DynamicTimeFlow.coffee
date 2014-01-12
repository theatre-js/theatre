IncrementalIsolate = require './dynamic/IncrementalIsolate'
_Emitter = require './_Emitter'
array = require 'utila/scripts/js/lib/array'
Prop = require './dynamic/Prop'

module.exports = class DynamicTimeFlow extends _Emitter

	constructor: (fps = 60) ->

		super

		@t = 0

		unless Number.isFinite(fps)

			throw Error "Fps must be a finite integer"

		@fps = parseInt fps

		@_frameLength = 1000 / @fps

		@_fpsT = @_calcuateFpsT @t

		@_arrays = {}

		@_incrementalIsolates = {}

		@_allProps = {}

		@_regularProps = {}

		@timelineLength = 0

	serialize: ->

		se = _allProps: {}

		for name, prop of @_allProps

			se._allProps[name] = prop.serialize()

		se

	loadFrom: (se) ->

		serializedKeys = Object.keys(se._allProps)

		currentKeys = Object.keys(@_allProps)

		for i, name of currentKeys

			unless serializedKeys[i] is name

				throw Error "Prop number #{i} is supposed to be '#{name}', but is #{serializedKeys[i]}"

		unless serializedKeys.length is currentKeys.length

			throw Error "Number of props is supposed to be #{currentKeys.length}. Given: #{serializedKeys.length}"

		for id, prop of @_allProps

			prop.loadFrom se._allProps[id]

		return

	_calcuateFpsT: (t) ->

		parseInt Math.floor(t / @_frameLength) * @_frameLength

	_maximizeTimelineLength: (dur) ->

		@timelineLength = Math.max(dur, @timelineLength)

		@_emit 'length-change'

		return

	addArray: (name, array) ->

		if @_arrays[name]?

			throw Error "An array named '#{name}' already exists"

		@_arrays[name] = array

		@

	_verifyPropAdd: (id, arrayName, indexInArray) ->

		if @_allProps[id]?

			throw Error "A prop named '#{id}' already exists"

		unless @_arrays[arrayName]?

			throw Error "Couldn't find array named '#{arrayName}'"

		unless @_arrays[arrayName][indexInArray]?

			throw Error "Array '#{arrayName}' doesn't have an index of '#{indexInArray}'"

		return

	addProp: (id, arrayName, indexInArray) ->

		@_verifyPropAdd id, arrayName, indexInArray

		@_regularProps[id] = @_allProps[id] = new Prop @, id, arrayName, indexInArray

	defineIncrementalIsolate: (id, isolate) ->

		if @_incrementalIsolates[id]?

			throw Error "Another incremental isolate already exists with id '#{id}'"

		@_incrementalIsolates[id] = new IncrementalIsolate @, id, isolate

	getIncrementalIsolate: (id) ->

		@_incrementalIsolates[id]

	getProp: (id) ->

		@_regularProps[id]

	tick: (t) ->

		fpsT = @_calcuateFpsT t

		if t < @t

			@_tickBackward fpsT

		else

			@_tickForward fpsT

		for name, ic of @_incrementalIsolates

			ic._tickForTimeFlow fpsT

		@_fpsT = fpsT
		@t = t

		@_emit 'tick'

		return

	_pluckFromRegularProps: (prop) ->

		delete @_regularProps[prop.id]

		return

	_tickForward: (t) ->

		for name, prop of @_regularProps

			prop._tickForward t

		return

	_tickBackward: (t) ->

		for name, prop of @_regularProps

			prop._tickBackward t

		return

