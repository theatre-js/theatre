_Emitter = require './_Emitter'
fn = require './tools/fn'

module.exports = class _DynamicModel extends _Emitter

	constructor: ->

		super

		@_shouldReportLocalChange = yes

		@__wireLocalChange = fn.throttle @__wireLocalChange.bind(@), 500

	loadFrom: (se) ->

		@_shouldReportLocalChange = no

		@_loadFrom se

		@_shouldReportLocalChange = yes

	_reportLocalChange: ->

		return unless @_shouldReportLocalChange

		do @__wireLocalChange

	__wireLocalChange: ->

		unless @_serializedAddress?

			throw Error "A dynamic model must have a @_serializedAddress"

		if typeof @_serializedAddress is 'string'

			@_serializedAddress = [@_serializedAddress]

		@rootModel?.communicator?.wireLocalChange @_serializedAddress,

			@serialize()

		return