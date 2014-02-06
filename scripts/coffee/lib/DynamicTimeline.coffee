array = require 'utila/scripts/js/lib/array'
_Emitter = require './_Emitter'
PropOfArray = require './dynamicTimeline/PropOfArray'
PropOfObject = require './dynamicTimeline/PropOfObject'
EventsController = require './dynamicTimeline/EventsController'
IncrementalIsolate = require './dynamicTimeline/IncrementalIsolate'

module.exports = class DynamicTimeline extends _Emitter

	constructor: (fps = 60) ->

		super

		@t = 1000

		unless Number.isFinite(fps)

			throw Error "Fps must be a finite integer"

		@fps = parseInt fps

		@_frameLength = 1000 / @fps

		@_fpsT = @_calcuateFpsT @t

		@_arrays = {}

		@_objects = {}

		@_incrementalIsolates = {}

		@_allProps = {}

		@_regularProps = {}

		@_eventControllers = {}

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

				if @rootModel.debug

					console.log "Prop '#{name}' isn't found in the received serialized data"

				continue

			prop.loadFrom propData

		return

	_calcuateFpsT: (t) ->

		parseInt Math.floor(t / @_frameLength) * @_frameLength

	_maximizeDuration: (dur) ->

		if dur > @duration

			@duration = dur

			@_emit 'duration-change'

		return

	addArray: (name, array) ->

		if @_arrays[name]?

			throw Error "An array named '#{name}' already exists"

		@_arrays[name] = array

		@

	addObject: (name, obj) ->

		if @_objects[name]?

			throw Error "An object named '#{name}' already exists"

		@_objects[name] = obj

		@

	addPropOfArray: (id, arrayName, indexInArray) ->

		if @_allProps[id]?

			throw Error "A prop named '#{id}' already exists"

		unless @_arrays[arrayName]?

			throw Error "Couldn't find array named '#{arrayName}'"

		unless @_arrays[arrayName][indexInArray]?

			throw Error "Array '#{arrayName}' doesn't have an index of '#{indexInArray}'"

		@_regularProps[id] = @_allProps[id] = new PropOfArray @, id, arrayName, indexInArray

	addPropOfObject: (id, objectName, setter, getter) ->

		if @_allProps[id]?

			throw Error "A prop named '#{id}' already exists"

		unless @_objects[objectName]?

			throw Error "Couldn't find object named '#{objectName}'"

		unless @_objects[objectName][setter]?

			throw Error "Object '#{objectName}' doesn't have '#{setter}'"

		unless @_objects[objectName][getter]?

			throw Error "Object '#{objectName}' doesn't have '#{getter}'"

		@_regularProps[id] = @_allProps[id] = new PropOfObject @, id, objectName, setter, getter

	defineIncrementalIsolate: (id, isolate) ->

		if @_incrementalIsolates[id]?

			throw Error "Another incremental isolate already exists with id '#{id}'"

		@_incrementalIsolates[id] = new IncrementalIsolate @, id, isolate

	getIncrementalIsolate: (id) ->

		@_incrementalIsolates[id]

	getProp: (id) ->

		@_regularProps[id]

	addEventController: (id) ->

		if @_eventControllers[id]?

			throw Error "An event controller named #{id} already exists"

		@_eventControllers[id] = new EventsController @, id

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

		for name, c of @_eventControllers

			c._tickForward t

		return

	_tickBackward: (t) ->

		for name, prop of @_regularProps

			prop._tickBackward t

		for name, c of @_eventControllers

			c._tickBackward t

		return