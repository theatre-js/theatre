Emitter = require 'utila/scripts/js/lib/Emitter'
Easing = require 'timing-function'
raf = require 'raf-timing/scripts/js/lib/raf'

# From the old TouchAndDomExperiments
# https://github.com/AriaMinaei/TouchAndDomExperiments
module.exports = class Scrolla extends Emitter

	constructor: (options = {}) ->

		super

		# Free space to wiggle in.
		@space = 0

		# How big is the scrolling element (the child one).
		@size = 0

		@max = 0

		do @_recalculateMin

		@position = 0

		# Note:
		#
		# We have a @_puller and a @position.
		#
		# @position is the actual amount of scrolling
		# the current element has. It doesn't always increase/decrease
		# with touch movement, as the element might be getting pulled
		# out of its bounds.
		#
		# But @_puller always follows user's fingers. Its value will
		# be converted to @position using a function that simulates
		# the sticky effect.

		# puller delta.
		@_puller = @position

		# If we converted puller to delta, would it give the same
		# result as the current delta?
		@_pullerInSync = yes

		# To guess current velocity based on the last three moves.
		@_velocityRecords = []

		@_velocityThreshold = 0.01

		# Last velocity on the last animation frame.
		@_lastV = 0
		@_lastT = 0

		# An easing function used when scroller is stretching out
		# of bounds.
		@_stretchEasingFunction = Easing.quint.easeOut

		@_maxStretch = parseInt(options.maxStretch) or 1800

		if cache.stretch[@_maxStretch] is undefined

			cache.stretch[@_maxStretch] = {}

		@_stretchCache = cache.stretch[@_maxStretch]

		if cache.unstretch[@_maxStretch] is undefined

			cache.unstretch[@_maxStretch] = {}

		@_unstretchCache = cache.unstretch[@_maxStretch]

		@_stretchedMax = 0

		@_bounceTime = parseInt(options.bounceTime) or 750

		@_bounce =

			ing: no
			t: 0
			x: 0
			duration: 0

		@_shouldSlide = no

		do initBezier

		return null

	setPosition: (p) ->

		@position = +p

		@_emit 'position-change'

		@

	setLeftEdge: (left) ->

		@max = left

		@

	setRightEdge: (right) ->

		unless right?

			do @_recalculateMin

		else

			@min = - right

		@

	# todo: Accept Infinity for size
	setSizeAndSpace: (size = @size, space = @space, recalculate = yes) ->

		@size = +size
		@space = +space

		do @_recalculateMin if recalculate

		@

	_recalculateMin: ->

		@min = 0

		if @size > @space

			@min = - (@size - @space)

	drag: (delta) ->

		@_shouldSlide = no

		do @_syncPuller if not @_pullerInSync

		@_bounce.ing = no

		@_recordForVelocity delta

		@_puller = @_puller + delta

		@setPosition @_pullerToSticky @_puller

	_syncPuller: ->

		@_puller = @_stickyToPuller @position

		@_pullerInSync = yes

	_recordForVelocity: (delta) ->

		if @_velocityRecords.length is 0

			# Note:
			#
			# We're creating a whole new object, on every touchmove!
			# This is not optimal. We're gonna have to do some pulling
			# for that.
			@_velocityRecords.push
				d: delta
				t: Date.now()
			return

		else

			@_velocityRecords.push
				d: delta + @_velocityRecords[@_velocityRecords.length - 1].d
				t: Date.now()

			if @_velocityRecords.length > 3

				do @_velocityRecords.shift

	_pullerToSticky: (puller) ->

		if puller > @max

			@max + @_stretch(puller - @max)

		else if puller < @min

			@min - @_stretch(-(puller - @min))

		else

			puller

	_stretch: (puller) ->

		# Limit the puller to maximum stretch
		puller = Math.min puller, @_maxStretch

		cached = @_stretchCache[puller]

		if cached is undefined

			do @_cacheStretches

			return @_stretchCache[puller] || 0

		else

			return cached

	_unstretch: (stretched) ->

		stretched = Math.min Math.round(stretched), @_stretchedMax

		cached = @_unstretchCache[stretched]

		if cached is undefined

			do @_cacheStretches

			return @_unstretchCache[stretched] || 0

		else

			return cached

	_cacheStretches:  ->

		# The stretched delta
		stretched = 0

		# See the loop
		current = 0

		loop

			break if current > @_maxStretch

			stretched += 1.0 - @_stretchEasingFunction(current / @_maxStretch)

			@_stretchCache[current] = stretched

			@_unstretchCache[Math.round stretched] = current

			current++

		@_stretchedMax = stretched



	_stickyToPuller: (sticky) ->

		if sticky > @max

			return @max + @_unstretch( sticky - @max )

		else if sticky < @min

			return @min - @_unstretch( - ( sticky - @min ) )

		else

			return sticky

	# For when the finger is released. It'll calculate velocity, and
	# if it should still be moving.
	release: ->

		@_shouldSlide = yes

		@_setLastVelocity @_getRecordedVelocity()

		@_pullerInSync = no

		# If we're out of bounds, and the user has swiped inbound
		if (@_puller < @min and @_lastV > 0) or (@_puller > @max and @_lastV < 0)

			# Don't bounce
			@_bounce.skip = yes

		do @animate

	_setLastVelocity: (v) ->

		@_lastV = v
		@_lastT = Date.now()

	_getRecordedVelocity: ->

		length = @_velocityRecords.length

		v = 0

		if length > 1

			first = @_velocityRecords[0]
			last  = @_velocityRecords[length - 1]

			# only calculate v if the there  has been at least one
			# touchmove in the last 50 milliseconds.
			if Date.now() - last.t < 50

				v = (last.d - first.d) / (last.t - first.t) / 1.1

		do @_clearVelocityRecords

		v = 0 unless (Math.abs v) > @_velocityThreshold

		return v

	_clearVelocityRecords: ->

		@_velocityRecords.length = 0

	stop: ->

		@_bounce.ing = no

		@_shouldSlide = no

		do @_syncPuller

	animate: =>

		return unless @_shouldSlide

		# Last x.
		x0 = @position

		# Last velocity.
		v0 = @_lastV

		# Elapsed time.
		deltaT = Date.now() - @_lastT

		# Do a step with the current deltaT.
		{x, v} = @_animStep x0, v0, deltaT

		# If the movement has been more than 10pixels,
		# and if x is currently outside the bounds, and the movement isn't
		# inbounds (Because inbound movement doesn't need higher resolutions)...
		if (x - x0 > 10 and not (x < @min)) or (x - x0 < -10 and not (x > @max))

			# ... we should calculate the movement in smaller steps to
			# get more accurate results.
			smallerDeltaT = deltaT / 4

			x = x0

			v = v0

			for i in [1..4]

				{x, v} = @_animStep x, v, smallerDeltaT

		# Update the velocity.
		@_setLastVelocity v

		# Update the delta.
		@setPosition x

		@_shouldSlide = no

		# Only not ask for animation if:
		#
		# we're inside the bounds, AND
		# velocity is close to zero, OR
		# there has been change in velocity direction.
		#
		unless @min <= x <= @max and v * v0 < 0.0001

			@_shouldSlide = yes

			requestAnimationFrame @animate

		null

	_animStep: (x0, v0, deltaT) ->

		ret =
			x: 0
			v: 0

		if x0 < @min

			deltas = @_deltasForOutside @min - x0, -v0, deltaT

			ret.x = x0 - deltas.deltaX

			ret.v = v0 - deltas.deltaV

		else if x0 > @max

			deltas = @_deltasForOutside x0 - @max, v0, deltaT

			ret.x = x0 + deltas.deltaX

			ret.v = v0 + deltas.deltaV

		else

			deltas = @_deltasForInside v0, deltaT

			ret.x = x0 + deltas.deltaX

			ret.v = v0 + deltas.deltaV

		ret

	_deltasForOutside: (x0, v0, deltaT) ->

		# Shouldn't skip a bounce if we're moving too slowly
		if -0.0001 < v0 < 0.0001

			@_bounce.skip = no

		# If we're almost moving inbounds and we shouldn't skip a bounce.
		if v0 < 0.15 and not @_bounce.skip

			# If bounce isn't initialized yet.
			if not @_bounce.ing

				# Initialize it.
				@_bounce.ing = yes

				# Bounce time.
				@_bounce.t = Date.now()

				# How far out of bounds were we when we started
				# the bounce.
				@_bounce.x = x0

			# Bounce back based on elapsed time and a bezier timing
			# function.
			newX = @_bounce.x - @_bounce.x *
				@_outsideCurve( ( Date.now() - @_bounce.t ) / @_bounceTime )

			# If we're too close to the edges, just don't do the bounce.
			if newX < 0.1

				ret =
					deltaX: -x0
					deltaV: -v0

				@_bounce.ing = no

			else

				ret =

					deltaX: newX - x0
					deltaV: - v0

			return ret

		# We're moving outbounds.

		# Slow down based on v0
		pullback = - 0.032 * v0
		# pullback = - 0.1 * Math.pow(v0, 3)

		# console.log v0

		# Calculate deltaV
		deltaV = pullback * deltaT

		ret =

			# DeltaX based on Euler's integrator
			deltaX: 0.5 * deltaV * deltaT + v0 * deltaT

			deltaV: deltaV

	_deltasForInside: (v0, deltaT) ->

		# When we're inside the bounds, disable bounce-skipping.
		@_bounce.skip = no

		# Direction of the initial velocity.
		direction = parseFloat unit v0

		# Friction based on direction and velocity.
		friction = -direction * 0.031 * Math.min(Math.abs(v0), 0.1)

		# Calculate the deltaV
		deltaV = friction * deltaT

		ret =

			# DeltaX based on Euler's integrator
			deltaX: 0.5 * deltaV * deltaT + v0 * deltaT

			deltaV: deltaV

	_outsideCurve: (t) ->

		bezier.solve t, UnitBezier.epsilon

UnitBezier = Easing.UnitBezier
{requestAnimationFrame, cancelAnimationFrame} = raf

unit = (n) ->

	return -1 if n < 0

	return 1

cache =

	stretch:

		0: 0

	unstretch:

		0: 0

bezier = null

initBezier = ->

	bezier = new UnitBezier 0.11, 0.02, 0.1, 0.98 unless bezier?