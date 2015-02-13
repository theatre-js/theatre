module.exports = class EventType

	constructor: (@controller, @id, options) ->

		@_hasValidator = no

		@_hasFilter = no

		if typeof options is 'function'

			@_fn = options

		else if typeof options is 'object'

			@_fn = options.fn

			unless typeof @_fn is 'function'

				throw Error "Event type must have an fn defined"

			if typeof options.validate is 'function'

				@_hasValidator = yes

				@_validate = options.validate

			if typeof options.filter is 'function'

				@_hasFilter = yes

				@_filter = options.filter

		else

			throw Error "Invalid options: #{options}"

		unless @_hasFilter

			@_filter = ->

		unless @_hasValidator

			@_validate = ->

	validate: (arg) ->

		if @_hasValidator then @_validate arg else yes

	filter: (arg) ->

		if @_hasFilter then @_filter arg else arg

	run: (forward, last, supposedT, currentT, args) ->

		@_fn forward, last, supposedT, currentT, args

		return