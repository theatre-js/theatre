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

		@_zoom = position: 0, duration: 0

		@pos = 3800

	_updateTimelineLength: ->

		@timelineLength = @timeFlow.timelineLength

		@_emit 'length-change'

		return

	_updateT: ->

		@t = @timeFlow.t

		@_emit 'time-change'

		return

	tick: (t) ->

		@timeFlow.tick t

		return

	changeZoomArea: (position, duration) ->

		unless Number.isFinite(position) and position > 0

			throw Error "Wrong position"

		unless Number.isFinite(duration) and duration > 0

			throw Error "Wrong duration"

		@_zoom.position = position
		@_zoom.duration = duration

		@_emit 'zoom-change'

		return

	getZoomArea: ->

		# if zoom area is unchanged...
		if @_zoom.position is 0 and @_zoom.duration is 0

			# zoom on the whole timeline plus 10 seconds
			@_zoom.duration = @timelineLength + 10000

		@_zoom