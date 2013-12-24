module.exports = class BezierRunner

	constructor: (@array, @indexInArray, @fromT, @fromVal, @toT, @toVal) ->

		@_tLen = @toT - @fromT

		@_vLen = @toVal - @fromVal

	runAt: (t) ->

		if t >= @toT

			do @_finish

			return false

		progress = (t - @fromT) / @_tLen

		@_set progress * @_vLen + @fromVal

		return true

	_finish: ->

		@_set @toVal

		return

	_set: (v) ->

		@array[@indexInArray] = v

		return