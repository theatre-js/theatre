_Emitter = require '../../_Emitter'

module.exports = class SeekbarModel extends _Emitter

	constructor: (@timeline) ->

		super

		@editor = @timeline.editor

		@timeFlow = @editor.timeFlow

		@timelineLength = 0

		@timeFlow.on 'length-change', =>

			do @_updateTimelineLength

			return

		do @_updateTimelineLength

		@t = 0

		@timeFlow.on 'tick', =>

			do @_updateT

			return

		do @_updateT

		# zommed area's position and duration
		@zoom = new Float32Array [0, 0]

		@pos = 3800

	_updateTimelineLength: ->

		@timelineLength = @timeFlow.timelineLength

		@_emit 'length-change'

		return

	_updateT: ->

		@t = @timeFlow.t

		@_emit 'time-change'

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