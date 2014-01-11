_Emitter = require './_Emitter'
RegularProp = require './dynamic/RegularProp'

module.exports = class DynamicTimeFlow extends _Emitter

	constructor: ->

		super

		@t = 0

		@setFps 60

		@_arrays = {}

		@_props = {}

		@timelineLength = 0

	setFps: (fps) ->

		unless Number.isFinite(fps)

			throw Error "Fps must be a finite integer"

		@fps = parseInt fps

		@_frameLength = 1000 / @fps

		@_fpsT = @_calcuateFpsT @t

		@

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

		if @_props[id]?

			throw Error "A prop named '#{id}' already exists"

		unless @_arrays[arrayName]?

			throw Error "Couldn't find array named '#{arrayName}'"

		unless @_arrays[arrayName][indexInArray]?

			throw Error "Array '#{arrayName}' doesn't have an index of '#{indexInArray}'"

		return

	addRegularProp: (id, arrayName, indexInArray) ->

		@_verifyPropAdd id, arrayName, indexInArray

		@_props[id] = new RegularProp @, id, arrayName, indexInArray

	getProp: (id) ->

		@_props[id]

	tick: (t) ->

		fpsT = @_calcuateFpsT t

		if t < @t

			@_tickBackward fpsT

		else

			@_tickForward fpsT

		@_fpsT = fpsT
		@t = t

		@_emit 'tick'

		return

	_tickForward: (t) ->

		for name, prop of @_props

			prop._tickForward t

		return

	_tickBackward: (t) ->

		for name, prop of @_props

			prop._tickBackward t

		return