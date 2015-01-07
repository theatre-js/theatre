module.exports = class Guide

	constructor: (@manager, @_t) ->

		@_el = null
		@_visible = no
		@_view = @manager.editor.scrollableArea.view

		do @_checkVisibility
		do @_registerEvents

		@

	_checkVisibility: ->

		vis = if @_t >= @_view.focusStart and @_t <= @_view.focusEnd then yes else no

		if @_visible isnt vis

			@_visible = vis

			@manager.updateView @

		return

	_registerEvents: ->

		@manager.editor.scrollableArea.view.events.on 'view-change', =>

			do @_checkVisibility

			do @_update

		return

	_update: ->

		if @_visible then do @_updatePos

		return

	_updatePos: ->

		@_el.x @_view.timeToFocusedX @_t

		return

	catchEl: (@_el) ->

		do @_updatePos

		return

	giveBackEl: ->

		@_visible = no

		e = @_el
		@_el = null

		e

	isVisible: ->

		@_visible


