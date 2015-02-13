_Emitter = require '../../../_Emitter'

module.exports = class GuideModel extends _Emitter

	constructor: (@guides, @t) ->

		super

	remove: ->

		@guides._remove @

		@_emit 'remove'

		@guides = null

		return