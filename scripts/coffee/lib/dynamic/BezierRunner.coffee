UnitBezier = require 'timing-function/scripts/js/lib/UnitBezier'

module.exports = class BezierRunner

	constructor: (@array, @indexInArray, @fromT, @fromVal, @toT, @toVal, controls) ->

		@_tLen = @toT - @fromT

		@_vLen = @toVal - @fromVal

		@_unitBezier = new UnitBezier controls[0], controls[1], controls[2], controls[3]

	runAt: (t) ->

		if t >= @toT

			do @_finish

			return false

		progress = (t - @fromT) / @_tLen

		@_set @_unitBezier.solveSimple(progress) * @_vLen + @fromVal

		return true

	_finish: ->

		@_set @toVal

		return

	_set: (v) ->

		@array[@indexInArray] = v

		return