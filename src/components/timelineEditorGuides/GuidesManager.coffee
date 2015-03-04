Guide = require './Guide'
GuidesPool = require './GuidesPool'

module.exports = class GuidesManager
	@type: 'leech'
	@target: 'studio-timelineEditor'
	@peerDeps:
		scrollableArea: 'studio-timelineEditor-scrollableArea'

	constructor: (@editor) ->
		@_pool = new GuidesPool @
		do @_initDummyGuides
		@

	_initDummyGuides: ->
		x = [100, 1000, 2500, 2600, 2700, 2800, 3400]
		for i in [0...7]
			new Guide @, x[i]
		return

	updateView: (guide) ->
		if guide.isVisible() then guide.catchEl @_pool.popEl() else @_pool.pushEl guide.giveBackEl()
		return
