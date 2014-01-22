IncrementalIsolate = require './dynamicTimeline/IncrementalIsolate'
_Emitter = require './_Emitter'
array = require 'utila/scripts/js/lib/array'
Prop = require './dynamicTimeline/Prop'

module.exports = class DynamicTimeline extends _Emitter

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

		@duration = 0

	setRootModel: (@rootModel) ->

	serialize: ->

		se = _allProps: {}

		for name, prop of @_allProps

			se._allProps[name] = prop.serialize()

		se

	loadFrom: (se) ->

		return unless se._allProps?

		for name, prop of @_allProps

			propData = se._allProps[name]

			unless propData?

				console.log "Prop '#{name}' isn't found in the received serialized data"

				continue

			prop.loadFrom propData

		return

	_calcuateFpsT: (t) ->

		parseInt Math.floor(t / @_frameLength) * @_frameLength

	_maximizeDuration: (dur) ->

		@duration = Math.max(dur, @duration)

		@_emit 'duration-change'

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

		if t < @t

			@_tickBackward t

		else

			@_tickForward t

		for name, ic of @_incrementalIsolates

			ic._tickForTimeline t

		@_fpsT = @_calcuateFpsT t
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

