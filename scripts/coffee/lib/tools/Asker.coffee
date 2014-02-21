Foxie = require 'foxie'

module.exports = class Asker

	constructor: (@rootView) ->

		@_tempKilidScope = @rootView.kilid.getTempScope()

		@_tempKilidScope.on 'enter'
		.onEnd => do @_commit

		@_tempKilidScope.on 'esc'
		.onEnd => do @_discard

		@_active = no

		@_validate = null

		@_cb = null

		@_value = 0

		@moosh = @rootView.moosh

		@kilid = @rootView.kilid

		do @_prepareNode

	_prepareNode: ->

		@node = Foxie '#asker'

		@questionNode = Foxie '#asker-question'
		.putIn @node

		@inputNode = Foxie 'input#asker-input'
		.putIn @node

		@inputNode.node.addEventListener 'keyup', =>

			if @_active

				@_setValue @inputNode.node.value

	_activate: ->

		return if @_active

		@_active = yes

		@node.putIn @rootView.mainBox.node

		@node.addClass 'visible'

		@inputNode.node.focus()

		@_tempKilidScope.activate()

		@moosh.ignore(@inputNode)

		@moosh.onClickOutside @node, =>

			do @_commit

	_deactivate: ->

		return unless @_active

		@_active = no

		@node.removeClass 'visible'

		@_tempKilidScope.deactivate()

		@moosh.discardClickOutside @node

		@moosh.unignore(@inputNode)

		@inputNode.removeClass 'invalid'

	ask: (stuff) ->

		@_setValidator stuff.validate

		@_cb = stuff.cb

		@questionNode.node.innerHTML = stuff.question

		if stuff.defaultValue?

			@inputNode.node.value = stuff.defaultValue

		else

			@inputNode.node.value = ''

		do @_activate

	_setValidator: (v) ->

		unless v?

			@_validate = null

			return

		if v instanceof Function

			@_validate = v

			return

		if v is 'number'

			@_validate = (n) -> String(n).match /^[0-9]+$/

			return

		if Array.isArray v

			@_validate = (n) -> n in v

	_commit: ->

		do @_deactivate

		@_cb yes, @_value

	_discard: ->

		do @_deactivate

		@_cb no

	_setValue: (v) ->

		if @_validate?

			unless @_validate v

				@inputNode.addClass 'invalid'

				return

			else

				@inputNode.removeClass 'invalid'

		@_value = v