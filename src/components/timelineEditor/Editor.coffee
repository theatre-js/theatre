ScrollableArea = require '../timelineEditorScrollableArea/ScrollableArea'
GuidesManager = require '../timelineEditorGuides/GuidesManager'
Panner = require '../timelineEditorPanner/Panner'
Model = require './Model'
View = require './View'

module.exports = class Editor

	constructor: (@manager, @id) ->

		@theatre = @manager.theatre

		@model = new Model @

		@view = new View @

		@scrollableArea = new ScrollableArea @

		@guidesManager = new GuidesManager @

		@panner = new Panner @