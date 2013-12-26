_Emitter = require '../../_Emitter'

module.exports = class SeekBar extends _Emitter

	constructor: (@model) ->

		super

		@timeFlow = @model.timeFlow

		@timelineLength = 0

		@timeFlow.on 'length-change', =>

			do @_updateTimelineLength

			return

		@viewSpace = 0

		# zommed area's position and duration
		@zoom = new Float32Array [0, 0]

	_updateTimelineLength: ->

		@timelineLength = @timeFlow.timelineLength

		@_emit 'length-change'

		return

	changeZoomArea: (position, duration) ->

		unless Number.isFinite position

			throw Error "Wrong position"

		unless Number.isFinite duration

			throw Error "Wrong duration"

		@zoom[0] = position
		@zoom[1] = duration

		@_emit 'zoom-change'

		return