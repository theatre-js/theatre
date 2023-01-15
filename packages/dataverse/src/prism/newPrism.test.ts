import {prism} from '@theatre/dataverse'

describe(`prism()`, () => {
  // these tests are going will act as a guide on how to use prisms.

  // prisms are a way to create a value that depends on other values.
  // prisms can be hot or cold, they have dependencies and dependents, and hot prisms can be stale or fresh.

  // let's start with a simple example:
  test(`using a pretty useless prism`, async () => {
    // each prism has a calculate function that it runs to calculate its value. let's make a simple function that just returns 1
    const calculate = jest.fn(() => 1)

    // now we can make a prism out of it
    const pr = prism(calculate)

    // now, this prism is pretty useless. it doesn't depend on anything, and it doesn't have any dependents.
    // but we can already illustrate some of the concepts that are important to understand prisms.

    // `calculate` won't be called until it's needed
    expect(calculate).not.toHaveBeenCalled()

    // we can get the value of the prism, which will be what `calculate` returned
    expect(pr.getValue()).toBe(1)

    // now the calculate function will have be called
    expect(calculate).toHaveBeenCalledTimes(1)

    // now, you might expect that if we call `getValue()` again, the calculate function won't be called again.
    // but that's not the case. the calculate function will be called again, because the prism is cold.
    // we'll talk about cold/hot in a bit, but let's just say that cold prisms are calculated every time they're read.

    pr.getValue()
    expect(calculate).toHaveBeenCalledTimes(2)

    // we can even check whether a prism is hot or cold. Ours is cold.
    expect(pr.isHot).toBe(false)

    // we'll get to hot prisms soon, but let's talk about dependencies and dependents first.
  })

  // prisms can depend on other prisms. let's make a prism that depends on another prism.
  test(`prisms can depend on other prisms`, async () => {
    const calculateA = jest.fn(() => 1)
    const a = prism(calculateA)

    const calculateATimesTwo = jest.fn(() => a.getValue() * 2)
    const aTimesTwo = prism(calculateATimesTwo)

    // clear the count of mocks
    function clearMocks() {
      calculateA.mockClear()
      calculateATimesTwo.mockClear()
    }

    // now, `aTimesTwo` depends on `a`.
    // In our parlance, `aTimesTwo` is a dependent of `a`, and `a` is a dependency of `aTimesTwo`.

    // now if we read the value of `aTimesTwo`, it will call `calculateATimesTwo`, which will call `calculateA`:
    expect(aTimesTwo.getValue()).toBe(2)
    expect(calculateA).toHaveBeenCalledTimes(1)
    expect(calculateATimesTwo).toHaveBeenCalledTimes(1)

    clearMocks()

    // and like we saw in the previous test, if we read the value of `aTimesTwo` again, it will call both of our calculate functions again:
    aTimesTwo.getValue()
    expect(calculateATimesTwo).toHaveBeenCalledTimes(1)
    expect(calculateA).toHaveBeenCalledTimes(1)

    clearMocks()

    // but if we read the value of `a`, it won't call `calculateATimesTwo`:
    a.getValue()
    expect(calculateATimesTwo).toHaveBeenCalledTimes(0)
    expect(calculateA).toHaveBeenCalledTimes(1)

    clearMocks()

    // now let's see what happens if we make our prism hot.

    // one way to do this, is to add an `onStale` listener to our prism.
    const onStale = jest.fn()
    const unsubscribe = aTimesTwo.onStale(onStale)

    // as soon as we do this, the prism will become hot.
    expect(aTimesTwo.isHot).toBe(true)

    // and so will its dependencies:
    expect(a.isHot).toBe(true)

    // so let's see what happens when we read the value of `aTimesTwo` again:
    aTimesTwo.getValue()
    // `calculateATimesTwo` will be called again,
    expect(calculateATimesTwo).toHaveBeenCalledTimes(1)
    // and so will `calculateA`,
    expect(calculateA).toHaveBeenCalledTimes(1)

    clearMocks()

    // but if we read `aTimesTwo` again, none of the calculate functions will be called again.
    aTimesTwo.getValue()
    expect(calculateATimesTwo).toHaveBeenCalledTimes(0)
    expect(calculateA).toHaveBeenCalledTimes(0)

    clearMocks()

    // this behavior propogates up the dependency chain, so if we read `a` again, `calculateA` won't be called again,
    // because its value is already fresh.
    a.getValue()
    expect(calculateA).toHaveBeenCalledTimes(0)

    clearMocks()

    // at this point, since none of our prisms depend on a prism whose value will change, they'll remain
    // fresh forever.
    a.getValue()
    aTimesTwo.getValue()
    a.getValue()
    aTimesTwo.getValue()

    expect(calculateATimesTwo).toHaveBeenCalledTimes(0)
    expect(calculateA).toHaveBeenCalledTimes(0)

    clearMocks()

    // but as soon as we unsubscribe from our `onStale()` listener, the prisms will become cold again.
    unsubscribe()
    expect(aTimesTwo.isHot).toBe(false)
    expect(a.isHot).toBe(false)

    // and they'll return back to their cold behavior.
    aTimesTwo.getValue()
    expect(calculateATimesTwo).toHaveBeenCalledTimes(1)
    expect(calculateA).toHaveBeenCalledTimes(1)

    clearMocks()

    aTimesTwo.getValue()
    expect(calculateATimesTwo).toHaveBeenCalledTimes(1)
    expect(calculateA).toHaveBeenCalledTimes(1)

    clearMocks()

    // now, one more thing before we move on. What will if we make `a` hot, but not `aTimesTwo`?
    // let's try it out.
    const unsubcribeFromAOnStale = a.onStale(() => {})
    // a will go hot
    expect(a.isHot).toBe(true)
    // but aTimesTwo will stay cold
    expect(aTimesTwo.isHot).toBe(false)

    // now let's read the value of `a`
    a.getValue()

    // `calculateA` will be called
    expect(calculateA).toHaveBeenCalledTimes(1)
    // and obviously `calculateATimesTwo` won't be called
    expect(calculateATimesTwo).toHaveBeenCalledTimes(0)

    clearMocks()

    // and if we re-read the value of `a`, `calculateA` won't be called again, becuase `a` is hot and its value is fresh.
    a.getValue()
    expect(calculateA).toHaveBeenCalledTimes(0)

    clearMocks()

    // but if we read the value of `aTimesTwo`, `calculateATimesTwo` will be called, because `aTimesTwo` is cold.
    aTimesTwo.getValue()
    expect(calculateATimesTwo).toHaveBeenCalledTimes(1)
    // yet `calculateA` won't be called, because `a` is hot and its value is fresh.
    expect(calculateA).toHaveBeenCalledTimes(0)

    clearMocks()

    // in conclusion, if we make a prism hot, it'll make its dependencies hot too.
    // if we read the value of a cold prism, it'll call its calculate function, which will
    // call the calculate functions of its dependencies, and so on.
    // but if we read the value of a hot prism, it'll only call its calculate function if its value is stale.

    // le'ts wrap up this part by unsubscribing from `a`'s `onStale` listener to not have any lingering listeners.
    unsubcribeFromAOnStale()
  })

  // so far, our prisms have not depended on any changing values, so in turn, _their_ values have never changed either.
  // but what if we want to create a prism that depends on a changing value?
  // we call those values "sources", and we can create them using the `prism.source()` hook:
  test('prism.source()', () => {
    // let's say we want to create a prism that depends on this value:
    let value = 0

    {
      // the _wrong_ way to do this, is to create a prism that directly reads this value
      const p = prism(() => value)

      // this will actually work if the prism is cold:
      expect(p.getValue()).toBe(0)
      value = 1
      expect(p.getValue()).toBe(1)

      // but if we make the prism hot, it'll never update its value, because it's not subscribed to any sources.
      const unsubscribe = p.onStale(() => {})
      expect(p.isHot).toBe(true)
      // on first read, it'll give us the current value of `value`, which is 1.
      expect(p.getValue()).toBe(1)
      // but if we change `value` again, the prism won't know
      value = 2
      expect(p.getValue()).toBe(1)
      // and so it'll keep returning the old value.
      expect(p.getValue()).toBe(1)

      unsubscribe()
    }

    // so, the _right_ way to do this, is to use the `source` hook:
    {
      // the source hook requires a `listen` function, and a `get` function.
      // let's skip the `listen` function for now, and just focus on the `getValue` function.
      const listen = jest.fn(() => () => {})
      // the `getValue` function should return the current value of the source.
      const get = jest.fn(() => value)

      const p = prism(() => {
        return prism.source(listen, get) * 2
      })

      value = 1

      // our prism is cold right now. let's see what happens when we read its value.
      expect(p.getValue()).toBe(2)
      // `get` will be called once, because we're reading the value of the source for the first time.
      expect(get).toHaveBeenCalledTimes(1)
      // and `listen` won't be called at all
      expect(listen).toHaveBeenCalledTimes(0)

      get.mockClear()

      // now let's make the prism hot
      const unsubscribe = p.onStale(() => {})
      expect(p.isHot).toBe(true)
      expect(p.getValue()).toBe(2)
      // `get` will be called again, because we're reading the value of the source for the second time.
      expect(get).toHaveBeenCalledTimes(1)
      // and `listen` will be called once, because our prism wants to be notified when the source changes.
      expect(listen).toHaveBeenCalledTimes(1)

      get.mockClear()
      listen.mockClear()

      // now, since our `listen` function is a mock, it won't actually do anything,
      // so the prism still won't know when the source changes.
      value = 2
      expect(p.getValue()).toBe(2)
      // `get` won't be called again, because the source hasn't changed.
      expect(get).toHaveBeenCalledTimes(0)

      unsubscribe()
    }

    {
      let value = 0
      // now let's implement an actual `listen` function.

      // first, we need to keep track of all the listeners that our source wil have
      const listeners = new Set<(val: number) => void>()

      // the `listen` function should return an stop function.
      // the stop function should stop listening to the source.
      const listen = jest.fn((fn) => {
        listeners.add(fn)

        return function stop() {
          listeners.delete(fn)
        }
      })

      const get = jest.fn(() => value)

      // and now we need to define a function that will notify all the listeners that the source has changed.
      const set = (newValue: number) => {
        if (newValue !== value) {
          value = newValue
          listeners.forEach((fn) => fn(value))
        }
      }

      // don't worry, there are helpers for this in dataverse. but for now, we'll implement
      // it manually to understand how it works.

      // now let's create a prism that depends on our source.
      const p = prism(() => {
        return prism.source(listen, get) * 2
      })

      // let's make the prism hot
      const staleListener = jest.fn()
      const unsubscribe = p.onStale(staleListener)
      expect(p.isHot).toBe(true)

      // and let's read its value
      expect(p.getValue()).toBe(0)
      // `get` will be called once, because we're reading the value of the source for the first time.
      expect(get).toHaveBeenCalledTimes(1)
      // and `listen` will be called once, because our prism wants to be notified when the source changes.
      expect(listen).toHaveBeenCalledTimes(1)

      get.mockClear()
      listen.mockClear()

      // now let's change the value of the source
      set(1)

      // this time, our prism will know that the source has changed, and it'll update its value.
      expect(p.getValue()).toBe(2)

      // and that's how we can create a prism that depends on a changing value.

      unsubscribe()
    }
  })

  // in practice, we'll almost never need to use the `source` hook directly,
  // and we'll never need to provide our own `listen` and `get` functions.
  // instead, we'll use `Atom`s, which are sources that are already implemented for us.
  describe(`Basics of Atoms`, () => {
    // TODO
  })
})
