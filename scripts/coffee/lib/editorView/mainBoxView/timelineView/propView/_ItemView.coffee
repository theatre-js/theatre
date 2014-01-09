module.exports = class _ItemView

	constructor: ->

		@rootView = @prop.rootView

	_remove: ->

		@prop._removeItem @

		return