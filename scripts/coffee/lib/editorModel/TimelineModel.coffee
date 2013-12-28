_Emitter = require '../_Emitter'

module.exports = class TimelineModel extends _Emitter

	constructor: (@editor) ->

		super

	isVisible: ->

		yes