ScrollableArea = require '../timelineEditorScrollableArea/ScrollableArea'
# GuidesManager = require '../timelineEditorGuides/GuidesManager'
StripsContainer = require '../timelineEditorStripsContainer/StripsContainer'
Panner = require '../timelineEditorPanner/Panner'
Model = require './Model'
View = require './View'

module.exports = class Editor

	constructor: (@manager, @id) ->

		@theatre = @manager.theatre

		@model = new Model this

		@view = new View this

		@scrollableArea = new ScrollableArea this

		@panner = new Panner this

		@stripsContainer = new StripsContainer this

		# @guidesManager = new GuidesManager @