ConnectionToServer = require './communicator/ConnectionToServer'

module.exports = class Communicator

	constructor: (@editor, @_server, @_namespaceName, @_password) ->

		@connection = new ConnectionToServer @

		@connection.connect().then @_load

		@_loaded = no

	_load: =>

		console.log 'asking for head-data' if @editor.debug

		@connection.request('head-data').then (data) =>

			console.log 'received head-data', data if @editor.debug

			@editor.loadFrom data

			@_loaded = yes

	wireLocalChange: (address, newData) ->

		unless @_loaded

			console.log 'cannot wire anything when not loaded' if @editor.debug

			return

		if @editor.debug

			console.info 'local change', address, newData

			console.info 'wiring local change for', address

		req =

			address: address

			newData: newData

		@connection.request('replace-part-of-head', req)

		.then (response) =>

			console.log 'server responded for', address, response if @editor.debug

			return

		return