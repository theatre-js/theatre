CursorControl = require './tools/CursorControl'
El = require 'stupid-dom-interface'
ComponentInjector = require './ComponentInjector'
componentsMap = require './componentsMap'

Moosh = require 'moosh'
Kilid = require 'kilid'

module.exports = class Studio

	constructor: ->
		@componentInjector = new ComponentInjector
		@componentInjector.register 'componentInjector', @componentInjector
		@componentInjector.register 'studio', this
		@componentInjector.register componentsMap

		@containerEl = El '.theatrejs'
		.inside document.body

		@kilid = new Kilid().getRootScope()
		@moosh = new Moosh document.body, @kilid
		@cursor = new CursorControl

		@componentInjector.initialize()