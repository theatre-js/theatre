ConnectionToServer = require './communicator/ConnectionToServer'

module.exports = class Communicator

	constructor: (@editor, @_server, @_namespaceName, @_password) ->

		@connection = new ConnectionToServer @

		@connection.connect().then =>

			do @_load

	_load: =>

		console.log 'asking for head-json'

		@connection.askFor('head-json').then (data) =>

			console.log 'received head-json'

			@editor.loadFrom data