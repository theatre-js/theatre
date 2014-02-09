Prop = require './Prop'

module.exports = class PropOfObject extends Prop

	constructor: (timeline, id, @objectName, @_objectSetterName, @initial = 0.0) ->

		super

		@object = @timeline._objects[@objectName]

	_set: (val) ->

		@object[@_objectSetterName] val

		return