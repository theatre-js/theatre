require '../../_prepare'

PacsTimeline = mod 'dynamic/prop/PacsTimeline'

makePacs = ->

	updates = [Infinity, -Infinity]

	Object.defineProperty updates, 'reset',

		value: ->

			updates[0] = Infinity
			updates[1] = -Infinity

	p = new PacsTimeline {}

	p._setUpdateRange = (from, to) ->

		updates[0] = Math.min(updates[0], from)
		updates[1] = Math.max(updates[1], to)

		return

	p.updates = updates

	p

describe 'adding'

it "should correctly add points and connectors and report updates", ->

	p = makePacs()

	p100 = p.addPoint 100, 0, 1, 1, 1, 1

	p200 = p.addPoint 200, 0, 1, 1, 1, 1

	p.addConnector 100

	p.updates.should.be.like [100, Infinity]

	p.timeline.length.should.equal 3

it "should support adding points in between connected points", ->

	p = makePacs()

	p100 = p.addPoint 100, 0, 1, 1, 1, 1

	p200 = p.addPoint 200, 0, 1, 1, 1, 1

	p.addConnector 100

	p.updates.reset()

	p150 = p.addPoint 150, 0, 1, 1, 1, 1

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

	p.updates.should.be.like [100, 200]

it "should throw when adding an item in an occupied time", ->

	p = makePacs()

	p100 = p.addPoint 100, 0, 1, 1, 1, 1
	(->p100 = p.addPoint 100, 0, 1, 1, 1, 1).should.throw()

	p200 = p.addPoint 200, 0, 1, 1, 1, 1

	p.addConnector 100
	(->p100 = p.addPoint 100, 0, 1, 1, 1, 1).should.throw()

	(->p.addConnector 100).should.throw()

it "should throw when adding a connector in the wrong place", ->

	p = makePacs()

	p100 = p.addPoint 100, 0, 1, 1, 1, 1

	(->p.addConnector 100).should.throw()
	(->p.addConnector 50).should.throw()

describe 'removing'

it "should support removing a connector", ->

	p = makePacs()

	p100 = p.addPoint 100, 0, 1, 1, 1, 1

	p200 = p.addPoint 200, 0, 1, 1, 1, 1

	c = p.addConnector 100

	p.updates.reset()

	c.remove()

	p.timeline.length.should.equal 2

	p.timeline[0].t.should.equal 100
	p.timeline[0].isPoint().should.equal yes

	p.timeline[1].t.should.equal 200
	p.timeline[1].isPoint().should.equal yes

	p.updates.should.be.like [100, 200]

it "should support removing lonely points", ->

	p = makePacs()

	p100 = p.addPoint 100, 0, 1, 1, 1, 1

	p200 = p.addPoint 200, 0, 1, 1, 1, 1

	p300 = p.addPoint 300, 0, 1, 1, 1, 1

	p400 = p.addPoint 400, 0, 1, 1, 1, 1

	p.updates.reset()

	p200.remove()

	p.timeline.length.should.equal 3

	p.updates.should.be.like [200, 300]

	p.updates.reset()

	p400.remove()

	p.timeline.length.should.equal 2

	p.updates.should.be.like [400, Infinity]

	p.updates.reset()

	p100.remove()

	p.timeline.length.should.equal 1

	p.updates.should.be.like [100, 300]

	p.updates.reset()

	p300.remove()

	p.timeline.length.should.equal 0

	p.updates.should.be.like [300, Infinity]

it "should support removing points connected to the right", ->

	p = makePacs()

	p100 = p.addPoint 100, 0, 1, 1, 1, 1

	p200 = p.addPoint 200, 0, 1, 1, 1, 1

	p300 = p.addPoint 300, 0, 1, 1, 1, 1

	p400 = p.addPoint 400, 0, 1, 1, 1, 1

	p.addConnector 100
	p.addConnector 200
	p.addConnector 300

	p.updates.reset()

	p100.remove()

	p.timeline.length.should.equal 5

	p.updates.should.be.like [100, 200], [100, 200]

	p.timeline[0].t.should.equal 200

it "should support removing points connected to the left", ->

	p = makePacs()

	p100 = p.addPoint 100, 0, 1, 1, 1, 1

	p200 = p.addPoint 200, 0, 1, 1, 1, 1

	p300 = p.addPoint 300, 0, 1, 1, 1, 1

	p400 = p.addPoint 400, 0, 1, 1, 1, 1

	p.addConnector 100
	p.addConnector 200
	p.addConnector 300

	p.updates.reset()

	p400.remove()

	p.timeline.length.should.equal 5

	p.updates.should.be.like [300, Infinity]

	p.timeline[4].t.should.equal 300
	p.timeline[4].isPoint().should.equal yes

it "should support removing points connected from both sides", ->

	p = makePacs()

	p100 = p.addPoint 100, 0, 1, 1, 1, 1

	p200 = p.addPoint 200, 0, 1, 1, 1, 1

	p300 = p.addPoint 300, 0, 1, 1, 1, 1

	p.addConnector 100
	p.addConnector 200

	p.updates.reset()

	p200.remove()

	p.timeline.length.should.equal 2

	p.updates.should.be.like [100, 300]

	p.timeline[0].t.should.equal 100
	p.timeline[0].isPoint().should.equal yes

	p.timeline[1].t.should.equal 300
	p.timeline[1].isPoint().should.equal yes

describe 'changing time'

it "should support changing a point's time", ->

	p = makePacs()

	p100 = p.addPoint 100, 0, 1, 1, 1, 1

	p200 = p.addPoint 200, 0, 1, 1, 1, 1

	p300 = p.addPoint 300, 0, 1, 1, 1, 1

	p400 = p.addPoint 400, 0, 1, 1, 1, 1

	p500 = p.addPoint 500, 0, 1, 1, 1, 1

	p.addConnector 300
	p.addConnector 400

describe 'Point Helpers'

it "[get/has][next/prev]Connector()", ->

	p = makePacs()

	p100 = p.addPoint 100, 0, 1, 1, 1, 1

	p200 = p.addPoint 200, 0, 1, 1, 1, 1

	p300 = p.addPoint 300, 0, 1, 1, 1, 1

	p400 = p.addPoint 400, 0, 1, 1, 1, 1

	p500 = p.addPoint 500, 0, 1, 1, 1, 1

	c100 = p.addConnector 100
	c200 = p.addConnector 200

	p.updates.reset()

	p100.isConnectedToTheLeft().should.equal no
	expect(p100.getLeftConnector()).to.equal undefined

	p200.isConnectedToTheLeft().should.equal yes
	p200.getLeftConnector().should.equal c100

	p200.isConnectedToTheRight().should.equal yes
	p200.getRightConnector().should.equal c200

	p300.isConnectedToTheRight().should.equal no
	expect(p300.getRightConnector()).to.equal undefined

it "[get/has][next/prev]Point()", ->

	p = makePacs()

	p100 = p.addPoint 100, 0, 1, 1, 1, 1

	p200 = p.addPoint 200, 0, 1, 1, 1, 1

	p300 = p.addPoint 300, 0, 1, 1, 1, 1

	p400 = p.addPoint 400, 0, 1, 1, 1, 1

	p500 = p.addPoint 500, 0, 1, 1, 1, 1

	c100 = p.addConnector 100
	c200 = p.addConnector 200

	p.updates.reset()

	p100.hasLeftPoint().should.equal no
	p100.hasRightPoint().should.equal yes
	expect(p100.getLeftPoint()).to.equal undefined
	p100.getRightPoint().should.equal p200

	p200.hasLeftPoint().should.equal yes
	p200.hasRightPoint().should.equal yes
	expect(p200.getLeftPoint()).to.equal p100
	p200.getRightPoint().should.equal p300

	p500.hasLeftPoint().should.equal yes
	p500.hasRightPoint().should.equal no
	expect(p500.getLeftPoint()).to.equal p400
	expect(p500.getRightPoint()).to.equal undefined

describe "Connector Helpers"

it "get[Left/Right]Point()", ->

	p = makePacs()

	p100 = p.addPoint 100, 0, 1, 1, 1, 1

	p200 = p.addPoint 200, 0, 1, 1, 1, 1

	p300 = p.addPoint 300, 0, 1, 1, 1, 1

	p400 = p.addPoint 400, 0, 1, 1, 1, 1

	p500 = p.addPoint 500, 0, 1, 1, 1, 1

	c100 = p.addConnector 100
	c200 = p.addConnector 200

	c100.getLeftPoint().should.equal p100
	c100.getRightPoint().should.equal p200

	c200.getLeftPoint().should.equal p200
	c200.getRightPoint().should.equal p300

describe 'changing value'

it "should support changing a lonely point's value", ->

	p = makePacs()

	p100 = p.addPoint 100, 0, 1, 1, 1, 1

	p200 = p.addPoint 200, 0, 1, 1, 1, 1

	p300 = p.addPoint 300, 0, 1, 1, 1, 1

	p.updates.reset()

	p100.setValue 0.5

	p.updates.should.be.like [100, 200]

	p.updates.reset()

	p200.setValue 0.5

	p.updates.should.be.like [200, 300]

	p.updates.reset()

	p300.setValue 0.5

	p.updates.should.be.like [300, Infinity]

it "should support changing a connected point's value", ->

	p = makePacs()

	p100 = p.addPoint 100, 0, 1, 1, 1, 1

	p200 = p.addPoint 200, 0, 1, 1, 1, 1

	p300 = p.addPoint 300, 0, 1, 1, 1, 1

	p400 = p.addPoint 400, 0, 1, 1, 1, 1

	p.addConnector 100
	p.addConnector 200
	p.addConnector 300

	p.updates.reset()

	p100.setValue 0.5

	p.updates.should.be.like [100, 200]

	p.updates.reset()

	p100.setValue 0.56

	p.timeline.length.should.equal 7

	p.updates.should.be.like [100, 200]

	p.updates.reset()

	p200.setValue 0.5

	p.updates.should.be.like [100, 300]

	p.updates.reset()

	p300.setValue 0.5

	p.updates.should.be.like [200, 400]

	p.updates.reset()

	p400.setValue 0.5

	p.updates.should.be.like [300, Infinity]

describe 'changing handlers'

it "should support changing left handler", ->

	p = makePacs()

	p100 = p.addPoint 100, 0, 1, 1, 1, 1

	p200 = p.addPoint 200, 0, 1, 1, 1, 1

	p300 = p.addPoint 300, 0, 1, 1, 1, 1

	p400 = p.addPoint 400, 0, 1, 1, 1, 1

	p.addConnector 200

	p.updates.reset()

	p100.setLeftHandler 0.1, 0.9

	p.updates.should.be.like [Infinity, -Infinity]

	p200.setLeftHandler 0.1, 0.9

	p.updates.should.be.like [Infinity, -Infinity]

	p300.setLeftHandler 0.1, 0.9

	p.updates.should.be.like [200, 300]

it "should support changing right handler", ->

	p = makePacs()

	p100 = p.addPoint 100, 0, 1, 1, 1, 1

	p200 = p.addPoint 200, 0, 1, 1, 1, 1

	p300 = p.addPoint 300, 0, 1, 1, 1, 1

	p400 = p.addPoint 400, 0, 1, 1, 1, 1

	p.addConnector 200

	p.updates.reset()

	p100.setRightHandler 0.1, 0.9

	p.updates.should.be.like [Infinity, -Infinity]

	p200.setRightHandler 0.1, 0.9

	p.updates.should.be.like [200, 300]

	p.updates.reset()

	p300.setRightHandler 0.1, 0.9

	p.updates.should.be.like [Infinity, -Infinity]

it "should support changing both handlers", ->

	p = makePacs()

	p100 = p.addPoint 100, 0, 1, 1, 1, 1

	p200 = p.addPoint 200, 0, 1, 1, 1, 1

	p300 = p.addPoint 300, 0, 1, 1, 1, 1

	p400 = p.addPoint 400, 0, 1, 1, 1, 1

	p.addConnector 200
	p.addConnector 300

	p.updates.reset()

	p100.setBothHandlers 0.1, 0.9, 0.1, 0.9

	p.updates.should.be.like [Infinity, -Infinity]

	p200.setBothHandlers 0.1, 0.9, 0.4, 0.8

	p.updates.should.be.like [200, 300]

	p.updates.reset()

	p300.setBothHandlers 0.1, 0.9, 0.4, 0.8

	p.updates.should.be.like [200, 400]

	p.updates.reset()

	p400.setBothHandlers 0.1, 0.9, 0.4, 0.8

	p.updates.should.be.like [300, Infinity]