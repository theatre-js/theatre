require '../../_prepare'

PacsTimeline = mod 'dynamic/prop/PacsTimeline'

makePacs = ->

	updates = []

	p = new PacsTimeline

		_reportUpdate: (from, to) ->

			updates.push [from, to]

			return

	p.updates = updates

	p

describe 'situations'

it "should correctly add points and connectors and report updates", ->

	p = makePacs()

	p.addPoint 100, 0, 1, 1, 1, 1

	p.addPoint 200, 0, 1, 1, 1, 1

	p.addConnector 100

	p.updates.should.be.like [[100, Infinity], [200, Infinity], [100, 200]]

	p.timeline.length.should.equal 3

it "shold support adding points in between connected points", ->

	p = makePacs()

	p.addPoint 100, 0, 1, 1, 1, 1

	p.addPoint 200, 0, 1, 1, 1, 1

	p.addConnector 100

	p.updates.length = 0

	p.addPoint 150, 0, 1, 1, 1, 1

	p.timeline.length.should.equal 5

	p.timeline[0].t.should.equal 100
	p.timeline[0].isPoint().should.equal yes

	p.timeline[1].t.should.equal 100
	p.timeline[1].isConnector().should.equal yes

	p.timeline[2].t.should.equal 150
	p.timeline[2].isPoint().should.equal yes

	p.timeline[3].t.should.equal 150
	p.timeline[3].isConnector().should.equal yes

	p.timeline[4].t.should.equal 200
	p.timeline[4].isPoint().should.equal yes

	p.updates.should.be.like [[100, 200]]

it "should support removing a connector", ->

	p = makePacs()

	p.addPoint 100, 0, 1, 1, 1, 1

	p.addPoint 200, 0, 1, 1, 1, 1

	p.addConnector 100

	p.updates.length = 0

	p.removeConnector 100

	p.timeline.length.should.equal 2

	p.timeline[0].t.should.equal 100
	p.timeline[0].isPoint().should.equal yes

	p.timeline[1].t.should.equal 200
	p.timeline[1].isPoint().should.equal yes

	p.updates.should.be.like [[100, 200]]

it "should support removing lonely points", ->

	p = makePacs()

	p.addPoint 100, 0, 1, 1, 1, 1

	p.addPoint 200, 0, 1, 1, 1, 1

	p.addPoint 300, 0, 1, 1, 1, 1

	p.addPoint 400, 0, 1, 1, 1, 1

	p.updates.length = 0

	p.removePoint 200

	p.timeline.length.should.equal 3

	p.updates.should.be.like [[200, 300]]

	p.updates.length = 0

	p.removePoint 400

	p.timeline.length.should.equal 2

	p.updates.should.be.like [[400, Infinity]]

	p.updates.length = 0

	p.removePoint 100

	p.timeline.length.should.equal 1

	p.updates.should.be.like [[100, 300]]

	p.updates.length = 0

	p.removePoint 300

	p.timeline.length.should.equal 0

	p.updates.should.be.like [[300, Infinity]]

it "should support removing points connected to the right", ->

	p = makePacs()

	p.addPoint 100, 0, 1, 1, 1, 1

	p.addPoint 200, 0, 1, 1, 1, 1

	p.addPoint 300, 0, 1, 1, 1, 1

	p.addPoint 400, 0, 1, 1, 1, 1

	p.addConnector 100
	p.addConnector 200
	p.addConnector 300

	p.updates.length = 0

	p.removePoint 100

	p.timeline.length.should.equal 5

	p.updates.should.be.like [[100, 200]]

	p.timeline[0].t.should.equal 200

it "should support removing points connected to the left", ->

	p = makePacs()

	p.addPoint 100, 0, 1, 1, 1, 1

	p.addPoint 200, 0, 1, 1, 1, 1

	p.addPoint 300, 0, 1, 1, 1, 1

	p.addPoint 400, 0, 1, 1, 1, 1

	p.addConnector 100
	p.addConnector 200
	p.addConnector 300

	p.updates.length = 0

	p.removePoint 400

	p.timeline.length.should.equal 5

	p.updates.should.be.like [[300, Infinity]]

	p.timeline[4].t.should.equal 300
	p.timeline[4].isPoint().should.equal yes

it "should support points connected from both sides", ->

	p = makePacs()

	p.addPoint 100, 0, 1, 1, 1, 1

	p.addPoint 200, 0, 1, 1, 1, 1

	p.addPoint 300, 0, 1, 1, 1, 1

	p.addConnector 100
	p.addConnector 200

	p.updates.length = 0

	p.removePoint 200

	p.timeline.length.should.equal 2

	p.updates.should.be.like [[100, 300]]

	p.timeline[0].t.should.equal 100
	p.timeline[0].isPoint().should.equal yes

	p.timeline[1].t.should.equal 300
	p.timeline[1].isPoint().should.equal yes