module.exports.throttle = (fn, time = 1000) ->

	pending = no
	timer = null
	lastArgs = null

	pend = ->

		if pending

			clearTimeout timer

		timer = setTimeout run, time
		pending = yes

	run = ->

		pending = no

		fn.apply null, lastArgs

	->

		lastArgs = arguments

		do pend

		return