import React from 'react'
import styled from 'styled-components'
import ViewTracker from './view-tracker'
import ViewObserver from './view-observer'

const onView = jest.fn()
const onHide = jest.fn()
const onChange = jest.fn()
const defaultProps = {
  onView,
  onHide,
  onChange,
  children: <div id="test" />,
}

const clearMocks = () => {
  onView.mockClear()
  onHide.mockClear()
  onChange.mockClear()
}

const ElementToWatch = styled(props => <div {...props} id="test" />)`
  position: relative;
  top: 0;
  width: 100px;
  height: 100px;
  background: red;
`

const render = (props, method = mount) => {
  return method(
    <ViewTracker {...Object.assign({}, defaultProps, props)}>
      <ElementToWatch />
    </ViewTracker>,
  )
}

describe('<ViewTracker />', () => {
  describe('View (once = true)', () => {
    let component
    let instance

    beforeEach(() => {
      component = render()
      instance = component.instance()
    })

    afterEach(clearMocks)

    it('should create a new instance of the ViewObserver', () => {
      expect(instance.observer instanceof ViewObserver).toBeTruthy()
    })

    it('should be set once=true by default', () => {
      expect(component.props().once).toBeTruthy()
    })

    describe('Events', () => {
      it('should call the onChange event with the visibility state', () => {
        const { trackEvent } = instance

        trackEvent(false)
        expect(onChange).toHaveBeenCalledWith(false)
        trackEvent(true)
        expect(onChange).toHaveBeenCalledWith(true)
      })

      it('should call onView when visible', () => {
        const { trackEvent } = instance

        trackEvent(true)
        expect(onView).toHaveBeenCalledWith(true)
        expect(onHide).not.toHaveBeenCalled()
      })

      it('should call unobserve after firing onView', () => {
        const { trackEvent } = instance
        jest.spyOn(instance, 'unobserve')

        trackEvent(true)
        expect(onView).toHaveBeenCalled()
        expect(instance.unobserve).toHaveBeenCalled()
      })

      it('should call onHide when no longer visible', () => {
        const { trackEvent } = instance

        trackEvent(false)
        expect(onHide).toHaveBeenCalledWith(false)
        expect(onView).not.toHaveBeenCalled()
      })
    })

    describe('Unmount', () => {
      it('should unobserve the components on unmount', () => {
        component.unmount()
        expect(instance.observer).toBeNull()
      })
    })
  })

  describe('Impression (once = false)', () => {
    let component
    let instance

    beforeAll(() => {
      component = render({ once: false })
      instance = component.instance()
    })

    afterEach(clearMocks)

    it('should not unobserve after onView event', () => {
      const { trackEvent } = instance
      jest.spyOn(instance, 'unobserve')

      trackEvent(true)
      expect(onView).toHaveBeenCalledWith(true)
      expect(instance.unobserve).not.toHaveBeenCalled()
    })
  })
})
