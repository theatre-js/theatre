El = require 'stupid-dom-interface'

module.exports = class View

	constructor: (@panner) ->

		@theatre = @panner.theatre

		@model = @panner.model

		@box = @panner.box