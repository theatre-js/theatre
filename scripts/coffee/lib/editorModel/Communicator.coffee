ConnectionToServer = require './communicator/ConnectionToServer'

module.exports = class Communicator

	constructor: (@editor, @_server, @_namespaceName, @_password) ->

		@connection = new ConnectionToServer @

		@connection.connect().then @_load

	_load: =>

		console.log 'asking for head-data'

		@connection.request('head-data').then (data) =>

			console.log 'received head-data', data

			@editor.loadFrom data

	wireLocalChange: (address, newData) ->

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