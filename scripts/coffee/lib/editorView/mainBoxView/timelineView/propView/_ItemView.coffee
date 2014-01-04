module.exports = class _ItemView

	constructor: ->

	_timeToX: (t) ->

		t * @prop._widthToTimeRatio

	_valToY: (v) ->

		@_normalizeY @_normalizeValue(v) * @prop._heightToValueRatio

	_normalizeValue: (v) ->

		v - @model.pacs.bottom

	_normalizeY: (y) ->

		@prop._height - y