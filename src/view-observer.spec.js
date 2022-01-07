import React from 'react'
import { default as ViewObserver, THRESHOLD_STEPS } from './view-observer'

window.addEventListener = jest.fn()
window.removeEventListener = jest.fn()

const resetMocks = () => {
  window.addEventListener.mockClear()
  window.removeEventListener.mockClear()
}

const inViewport = {
  top: 0,
  left: 0,
  right: 600,
  bottom: 600,
}

const getVisibleElements = map => {
  const visibleElements = []

  map.forEach(({ visible }, element) => {
    if (visible) visibleElements.push(element)
  })

  return visibleElements
}

/**
 * [createElement description]
 * @return {Array} Returns [DOMNode, spy]
 */
const createElement = () => [mount(<div />).getDOMNode(), jest.fn()]

// Focus, orientationchange and resize
const NUM_EVENT_LISTENERS = 2

describe('ViewObserver', () => {
  let observer

  beforeEach(() => {
    observer = ViewObserver.get()
  })

  // Reset the event listeners after each test
  afterEach(() => {
    observer.destroy()
    observer = null
    resetMocks()
  })

  it('should have an options object with minTimeVisible and errorMargin props', () => {
    expect(observer.options).toEqual({
      minTimeVisible: 250,
      errorMargin: 0.05,
      percentCompensation: 0.1,
    })
  })

  it('should create an instance when get is called', () => {
    expect(observer instanceof ViewObserver).toBeTruthy()
  })

  it('should have the correct thresholds', () => {
    expect(observer.observer.thresholds).toHaveLength(THRESHOLD_STEPS + 1)
  })

  it('should not observe if no element or callback specified', () => {
    const [element, spy] = createElement()

    observer.observe()
    expect(observer.elements.size).toBe(0)

    observer.observe(element)
    expect(observer.elements.size).toBe(0)

    observer.observe(element, spy)
    expect(observer.elements.size).toBe(1)
  })

  it('should not try to unobserve an element if no observer exists', () => {
    const [element, spy] = createElement()
    observer.observe(element, spy)
    expect(() => observer.unobserve(element)).not.toThrow()
  })

  it('should create an instance of the IntersectionObserver in window', () => {
    expect(
      observer.observer instanceof window.IntersectionObserver,
    ).toBeTruthy()
  })

  it('should not create a new instance when get is called again', () => {
    expect(ViewObserver.get()).toBe(observer)
  })

  describe('No API Support', () => {
    it('should not try to instatiate the IntersectionObserver', () => {})
  })

  describe('Event Listeners', () => {
    it('should add focus event listener', () => {
      expect(window.addEventListener).toHaveBeenCalledWith(
        'focus',
        observer.reportVisibilityStates,
      )
    })

    it('should add event listener for device orientation change', () => {
      expect(window.addEventListener).toHaveBeenNthCalledWith(
        2,
        'orientationchange',
        observer.reportVisibilityStates,
      )
    })

    it('should remove event listeners', () => {
      observer.removeEventListeners()
      expect(window.removeEventListener).toHaveBeenCalledTimes(
        NUM_EVENT_LISTENERS,
      )
      for (let nthCall = 1; nthCall <= NUM_EVENT_LISTENERS; nthCall++) {
        expect(window.removeEventListener).toHaveBeenNthCalledWith(
          nthCall,
          expect.any(String),
          observer.reportVisibilityStates,
        )
      }
    })
  })

  describe('Watch Elements', () => {
    beforeEach(() => {
      observer.options.minTimeVisible = 0
    })

    const [element, spy] = createElement()

    const createEntry = (intersectionRatio = 1, bounds = inViewport) => ({
      entry: element,
      isIntersecting: true,
      getBoundingClientRect: () => bounds,
      intersectionRatio,
    })

    beforeEach(() => {
      jest.spyOn(observer, 'onVisibilityChange')

      observer.observe(element, spy)
    })

    afterEach(() => {
      observer.onVisibilityChange.mockClear()
      observer.unobserve(element)
      observer.elements = new Map()
    })

    it('should not fire visibility change before 100ms', async () => {
      const entries = [createEntry()]
      observer.options.minTimeVisible = 100
      observer.watchElements(entries)
      await sleep(50)
      expect(observer.onVisibilityChange).not.toHaveBeenCalled()
      await sleep(55)
      expect(observer.onVisibilityChange).toHaveBeenCalledWith(element, true)
    })

    it('should fire visibilty change if >= 250ms', async () => {
      const entries = [createEntry()]
      observer.options.minTimeVisible = 250
      observer.watchElements(entries)

      expect(observer.elements.get(element)).toHaveProperty('timeoutSet')
      expect(observer.elements.get(element).timeoutSet).toBe(true)
      expect(observer.timeouts.size).toBe(1)

      await sleep(250)

      expect(observer.onVisibilityChange).toHaveBeenCalledWith(element, true)
    })

    it('should clear the timeout and fire onVisibilityChange if not visible', () => {
      jest.spyOn(window, 'clearTimeout')

      const entries = [createEntry(0.5)]

      observer.watchElements(entries)

      expect(window.clearTimeout).toHaveBeenCalled()
      expect(observer.onVisibilityChange).toHaveBeenCalledWith(element, false)
    })

    it('Should return early if no elements are intersecting', () => {
      const elements = [
        { isIntersecting: false },
        { isIntersecting: false },
        { isIntersecting: false },
      ]
      jest.spyOn(observer, 'isElementHeightSimilarToContainer')
      observer.watchElements([elements])
      expect(observer.isElementHeightSimilarToContainer).not.toHaveBeenCalled()
    })

    it('should fire onVisibilityChange within viewport', async () => {
      const bounds = {
        top: 0,
        bottom: 500,
        left: 0,
        right: 500,
        width: 500,
        height: 500,
      }
      const entry = createEntry(1, bounds)

      observer.watchElements([entry])

      await sleep(1)

      expect(observer.onVisibilityChange).toHaveBeenCalledWith(element, true)
    })

    it('should return true if taller than viewport', async () => {
      const entry = createEntry(1)
      observer.watchElements([entry])
      await sleep(1)
      expect(observer.onVisibilityChange).toHaveBeenCalledWith(element, true)
    })

    it('should return true if wider than viewport', async () => {
      const bounds = {
        top: 100,
        bottom: 200,
        left: -200,
        right: 2000,
        width: 2200,
        height: 100,
      }

      const entry = createEntry(1, bounds)
      observer.watchElements([entry])
      await sleep(1)
      expect(observer.onVisibilityChange).toHaveBeenCalledWith(element, true)
    })

    it('should return true if taller & wider than viewport', async () => {
      const bounds = {
        top: -200,
        bottom: -200,
        left: -200,
        right: 2000,
        width: 2200,
        height: 2000,
      }

      const entry = createEntry(1, bounds)
      observer.watchElements([entry])
      await sleep(1)
      expect(observer.onVisibilityChange).toHaveBeenCalledWith(element, true)
    })

    it('should fail if not within bounds', () => {
      const bounds = {
        top: -1000,
        bottom: 0,
        left: -1000,
        right: 0,
        width: 200,
        height: 200,
      }

      const entry = createEntry(0, bounds)
      observer.watchElements([entry])
      expect(observer.onVisibilityChange).toHaveBeenCalledWith(element, false)
    })

    it('should exit early if timeout already set', async () => {
      const entry = createEntry(1)
      jest.spyOn(observer.timeouts, 'set')
      observer.elements.set(entry.entry, mount(<div />).getDOMNode())
      observer.elements.get(entry.entry).timeoutSet = true
      observer.watchElements([entry])

      expect(observer.timeouts.set).not.toHaveBeenCalled()
    })
  })

  describe('Element compensation', () => {
    it('should return true for height similar (10%) to viewport', () => {
      const element = 600
      const container = 660
      expect(
        observer.isElementHeightSimilarToContainer(element, container),
      ).toBeTruthy()
    })

    it('should return false for containers that are not similar in height', () => {
      const element = 100
      const container = 660
      expect(
        observer.isElementHeightSimilarToContainer(element, container),
      ).toBeFalsy()
    })

    it('should work with custom percentCompensation', () => {
      const element = 400
      const container = 660
      observer.options.percentCompensation = 0.5
      expect(
        observer.isElementHeightSimilarToContainer(element, container),
      ).toBeTruthy()
    })
  })

  describe('Observe', () => {
    it('should report the visibility state for all elements', async () => {
      const [element, spy] = createElement()

      observer.observe(element, spy)

      observer.elements.get(element).visible = true

      observer.reportVisibilityStates()

      expect(spy).toHaveBeenCalledWith(true)
    })
  })

  describe('Unobserve', () => {
    it('should not throw if element is omitted', () => {
      const [element] = createElement()

      expect(() => observer.unobserve()).not.toThrow()
      expect(() => observer.unobserve(element)).not.toThrow()
    })

    it('should remove the element from the elements map', () => {
      const [element, spy] = createElement()
      observer.observe(element, spy)
      expect(observer.elements.size).toBe(1)
      observer.unobserve(element)
      expect(observer.elements.size).toBe(0)
    })

    it('should destroy the observer if no more elements are being watched', () => {
      const [element, spy] = createElement()

      jest.spyOn(observer, 'destroy')

      observer.observe(element, spy)
      observer.unobserve(element)
      expect(observer.destroy).toHaveBeenCalled()
    })
  })

  describe('onVisibilityChange', () => {
    it('should return undefined if no element', () => {
      expect(observer.onVisibilityChange()).toBeUndefined()
    })

    it('should return undefined if element is being observed', () => {
      const [element] = createElement()
      expect(observer.onVisibilityChange(element)).toBeUndefined()
    })

    it('should get all visible elements', () => {
      const one = createElement()
      const two = createElement()

      observer.observe(...one)
      observer.observe(...two)

      observer.elements.get(one[0]).visible = true
      observer.elements.get(two[0]).visible = false

      expect(observer.elements.size).toEqual(2)

      const visible = getVisibleElements(observer.elements)

      expect(visible).toEqual([one[0]])
    })
  })

  describe('Destroy', () => {
    it('should clear all elements from the map', () => {
      jest.spyOn(observer.elements, 'clear')
      observer.destroy()
      expect(observer.elements.clear).toHaveBeenCalled()
    })

    it('should disconnect the IntersectionObserver', () => {
      jest.spyOn(observer.observer, 'disconnect')
      observer.destroy()
      expect(observer.observer.disconnect).toHaveBeenCalled()
    })

    it('should remove the event listeners', () => {
      jest.spyOn(observer, 'removeEventListeners')
      observer.destroy()
      expect(observer.removeEventListeners).toHaveBeenCalled()
    })
  })
})
