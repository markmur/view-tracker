import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'prop-types'
import ViewObserver from './view-observer'

class ViewTracker extends Component {
  static defaultProps = {
    once: true,
    children: null,
    options: {},
    onView() {},
    onHide() {},
    onChange() {},
  }

  static propTypes = {
    once: PropTypes.bool,
    options: PropTypes.shape({
      minTimeVisible: PropTypes.number,
      errorMargin: PropTypes.number,
    }),
    children: PropTypes.node,
    onView: PropTypes.func,
    onHide: PropTypes.func,
    onChange: PropTypes.func,
  }

  /**
   * Create the event listener on mount
   */
  componentDidMount() {
    this.observer = ViewObserver.get(this.props.options)

    this.container = findDOMNode(this)

    if (typeof this.container !== 'undefined') {
      // Observe the container and track all child nodes
      this.observer.observe(this.container, this.trackEvent)
    }
  }

  unobserve() {
    if (typeof this.container !== 'undefined' && this.observer) {
      // Remove the observation listener
      this.observer.unobserve(this.container)
    }

    this.observer = null
  }

  /**
   * Remove the observe listener on unmount
   */
  componentWillUnmount() {
    this.unobserve()
  }

  /**
   * Send the tracking event callback
   * @param  {Boolean} visible - the visibility state of the element
   */
  trackEvent = visible => {
    this.props.onChange(visible)

    if (visible) {
      this.props.onView(visible)

      // Unobserve the element after firing
      if (this.props.once) this.unobserve()
    } else {
      this.props.onHide(visible)
    }
  }

  render() {
    return React.Children.only(this.props.children)
  }
}

export default ViewTracker
