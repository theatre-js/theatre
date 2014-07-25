Emitter = require 'utila/scripts/js/lib/Emitter'

module.exports = class ScrollableAreaModel extends Emitter

	constructor: (@scrollableArea) ->

		super