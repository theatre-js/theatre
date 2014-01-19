sysPath = require 'path'
fs = require 'fs'
require '../../_prepare'

filePath = sysPath.join __dirname, '../../../../../xeno/audio/This Is Life.mp3'

fileBuffer = fs.readFileSync filePath

fileBufferToDataView = (fileBuffer) ->

	bufferLength = fileBuffer.length

	uint8 = new Uint8Array new ArrayBuffer bufferLength

	for i in [0..bufferLength]

		uint8[i] = fileBuffer[i]

	new DataView uint8.buffer

data = fileBufferToDataView fileBuffer

mp3Parser = require 'mp3-parser'

describe 'mp3'

it "should work", ->

	tagLength = 0

	id3v2 = mp3Parser.readId3v2Tag(data)

	if id3v2?

		# console.log id3v2

		tagLength = id3v2._section.byteLength

		console.log 'id3v2 byte length', tagLength

	skipped = 0
	toShow = 2

	for i in [0..100000]

		ret = mp3Parser.readFrameHeader data, i

		if ret?

			skipped++

			if skipped is toShow + 1

				console.log i, ret

				break