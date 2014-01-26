ConnectionToServer = require './communicator/ConnectionToServer'

module.exports = class Communicator

	constructor: (@editor, @_server, @_namespaceName, @_password) ->

		@connection = new ConnectionToServer @

		@connection.connect().then @_load

		@_loaded = no

	_load: =>

		console.log 'asking for head-data'

		@connection.request('head-data').then (data) =>

			console.log 'received head-data', data

			@editor.loadFrom data

			@_loaded = yes

	wireLocalChange: (address, newData) ->

		unless @_loaded

			console.log 'cannot wire anything when not loaded'

			return

		console.log 'local change', address, newData

		console.log 'wiring local change for', address

		req =

			address: address

			newData: newData

		@connection.request('replace-part-of-head', req)

		.then (response) =>

			console.log 'server responded with', response

			return

		return