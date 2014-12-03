ScrollableArea = require '../timelineBoxScrollableArea/ScrollableArea'
GuidesManager = require '../timelineBoxGuides/GuidesManager'
Panner = require '../timelineBoxPanner/Panner'
Model = require './Model'
View = require './View'

module.exports = class Box

	constructor: (@manager, @id) ->

		@theatre = @manager.theatre

		@model = new Model @

		@view = new View @

		@scrollableArea = new ScrollableArea @

		@guidesManager = new GuidesManager @

		@panner = new Panner @