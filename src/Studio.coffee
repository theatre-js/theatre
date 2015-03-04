El = require 'stupid-dom-interface'
Moosh = require 'moosh'
Kilid = require 'kilid'
componentsMap = require './componentsMap'
CursorControl = require './tools/CursorControl'
ComponentInjector = require './ComponentInjector'

module.exports = class Studio

	constructor: ->
		@componentInjector = new ComponentInjector
		@componentInjector.register 'componentInjector', @componentInjector
		@componentInjector.register 'studio', this
		@componentInjector.register componentsMap

		@containerEl = El '.theatrejs'
		.inside document.body

		@componentInjector.register 'kilid', kilid = new Kilid().getRootScope()
		@componentInjector.register 'moosh', new Moosh document.body, kilid
		@componentInjector.register 'cursor', new CursorControl

		@componentInjector.initialize()