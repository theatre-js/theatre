Foxie = require 'foxie'

module.exports = class Asker

	constructor: (@rootView) ->

		@_tempKilidScope = @rootView.kilid.getTempScope()

		@_tempKilidScope.on 'esc', => do @_discard

		@_active = no

		@_cb = null

		@moosh = @rootView.moosh

		@kilid = @rootView.kilid

		do @_prepareNode

	_prepareNode: ->

		@node = Foxie '#chooser'

		@questionNode = Foxie '#chooser-question'
		.putIn @node

		@choicesNode = Foxie '#chooser-choices'
		.putIn @node

	_activate: ->

		return if @_active

		@_active = yes

		@node.putIn @rootView.mainBox.node

		@node.addClass 'visible'

		@_tempKilidScope.activate()

		@moosh.onClickOutside @node, =>

			do @_discard

	_deactivate: ->

		return unless @_active

		@_active = no

		@node.removeClass 'visible'

		@_tempKilidScope.deactivate()

		@moosh.discardClickOutside @node

		@choicesNode.node.innerHTML = ''

	choose: (q, choices, cb) ->

		@_cb = cb

		@questionNode.node.innerHTML = q

		for c in choices then do (c) =>

			node = Foxie '.choice'
			.putIn @choicesNode

			node.node.innerHTML = c

			@moosh.onClick node
			.onDone =>

				@_cb yes, c

				do @_deactivate

			return

		do @_activate

	_discard: ->

		@_cb no

		do @_deactivate