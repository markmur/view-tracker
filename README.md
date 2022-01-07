# View Tracker

React view/impression tracking component to determine if a user has seen 100% a given
element for a minimum of 250ms.

## Props

| Name         | Type                       | Required | Default                                                                | Description                                                                                                                   |
| ------------ | -------------------------- | -------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `once`       | Boolean                    |          | true                                                                   | Boolean to indicate whether to track an element _once_. Set to false to fire the `onView` event every time it comes into view |
| `options`    | Object                     |          | `{ minTimeVisible: 250, errorMargin: 0.05, percentCompensation: 0.1 }` | Options for `ViewObserver` instantiation                                                                                      |
| `children`   | Node                       |          |                                                                        | A single element to track                                                                                                     |
| `onView()`   | Function(visible: Boolean) |          |                                                                        | Callback fired when element meets impression conditions                                                                       |
| `onHide()`   | Function(visible: Boolean) |          |                                                                        | Callback fired when element goes out of view                                                                                  |
| `onChange()` | Function(visible: Boolean) |          |                                                                        | Callback fired when element visibility changes                                                                                |

## Usage

**NOTE** The `ViewTracker` uses `React.Children.only` to enforce a single child node. It will throw an error if you try to specify an array of children.

```js
import React, { Component } from 'react'
import { ViewTracker } from 'view-tracker'

class App extends Component {
  sendEvent = componentName => () => {
    // Send event to google analytics
    eventBus.trigger('tracking:event', /* { tracking options } */)
  })

  render() {
    return (
      <div>
        <ViewTracker onView={this.sendEvent('component-1')}>
          <ComponentOne />
        </ViewTracker>

        <ViewTracker onView={this.sendEvent('component-2')}>
          <ComponentTwo />
        </ViewTracker>
      </div>
    )
  }
}
```

### Tracking an impression

A "view" refers to the sending of a tracking event strictly _once_ when an element comes into view. A "impression" refers to tracking an element _every time_ it comes into view. Prior to `v1.0.0`, "impressions" were the default behaviour. This has since changed and `once={true}` is set by default. If you specifically want to track an element every time it comes into view, set the `once` prop to `false`.

```js
import { ViewTracker } from 'view-tracker'

const trackImpression = () => {
  // This event will be fired every time the element comes into view
}

<ViewTracker once={false} onView={trackImpression}>
  <ComponentOne />
</ViewTracker>
```

## Rules for View

| Rules (View) `once={true}`                                 |
| ---------------------------------------------------------- |
| Must be 100% visible in the viewport                       |
| Visible for minimum of 250ms                               |
| Must completely cover the viewport if larger than viewport |

## Rules for Impression (_deprecated_)

> The following guideline is now deprecated in favour of the one above

| Rules (Impression) `once={false}`                                     |
| --------------------------------------------------------------------- |
| Views must be tracked every time the element disappears and reappears |
| Fire event on window focus                                            |
| Fire event on orientation change                                      |
| Fire event is screen resolution changes                               |

---