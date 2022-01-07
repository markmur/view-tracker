import React, { Component } from 'react'
import pkg from '../package.json'
import { ViewTracker, DEFAULT_OPTIONS } from '../src'
import {
  Box,
  Content,
  Sidebar,
  Code,
  Title,
  Flex,
  Input,
  InputContainer,
  MenuIcon,
  HighlightedBorder,
} from './styles'

let errorMargin = 0

if (typeof window !== 'undefined') {
  errorMargin = (window.innerHeight * DEFAULT_OPTIONS.percentCompensation) / 2
}

class App extends Component {
  state = {
    sidebarOpen: true,
    once: false,
    width: '600px',
    height: '100vh',
    ml: '5vw',
    mr: 0,
    mt: '100px',
    mb: '400px',
    visible: {},
    numberElements: 1,
  }

  _tracker = React.createRef()

  trackImpression = id => visible => {
    if (visible) console.log('%c[Track] Impression', 'color:green', id)
    this.setState(state => ({
      visible: Object.assign({}, state.visible, { [id]: visible }),
    }))
  }

  isVisible = key =>
    Object.keys(this.state.visible).includes(String(key)) &&
    this.state.visible[key]

  elementHeightSimilarToViewport(elementHeight) {
    if (typeof window !== 'undefined') {
      const diff = window.innerHeight * DEFAULT_OPTIONS.percentCompensation

      return (
        elementHeight >= window.innerHeight - diff &&
        elementHeight <= window.innerHeight + diff
      )
    }
  }

  renderComponent = id => (
    <ViewTracker
      key={id}
      ref={this._tracker}
      once={this.state.once}
      onChange={this.trackImpression(id)}
    >
      <Box
        id="test"
        color={this.isVisible(id) ? 'green' : 'red'}
        height={this.state.height}
        width={this.state.width}
        ml={this.state.ml}
        mr={this.state.mr}
        mt={this.state.mt}
        mb={this.state.mb}
      >
        {this.elementHeightSimilarToViewport(
          this._tracker.current
            ? this._tracker.current.container.clientHeight
            : 0,
        ) && <HighlightedBorder errorMargin={errorMargin} />}
        <p>
          Elements with a height similar to the viewport height (i.e within +/-
          10% of the viewport height) are given a 40px error margin to ensure
          they have been tracked.
        </p>

        <p>An element must be visible for at least 250ms to be tracked.</p>
      </Box>
    </ViewTracker>
  )

  handleChange = (field, eventAttr = 'value') => event => {
    this.setState({
      [field]: event.target[eventAttr],
    })
  }

  renderInput = (key, placeholder, type = 'string') => {
    const inputProps = {}

    if (type === 'checkbox') inputProps.checked = this.state[key]
    else inputProps.value = this.state[key]

    return (
      <InputContainer>
        <label htmlFor={key}>{placeholder}</label>
        <Input
          type={type}
          name={key}
          placeholder={placeholder}
          onChange={this.handleChange(
            key,
            type === 'checkbox' ? 'checked' : 'value',
          )}
          {...inputProps}
        />
      </InputContainer>
    )
  }

  toggleSidebar = () =>
    this.setState(({ sidebarOpen }) => ({
      sidebarOpen: !sidebarOpen,
    }))

  render() {
    const { visible } = this.state

    return (
      <div>
        <MenuIcon onClick={this.toggleSidebar} />

        <Flex wrap={false}>
          <Sidebar open={this.state.sidebarOpen}>
            <div style={{ padding: '2em' }}>
              <Title>
                View Tracker <small>(v{pkg.version})</small>
              </Title>

              <Code>yarn add view-tracker</Code>

              <Flex>
                {this.renderInput('mt', 'Margin Top')}
                {this.renderInput('mb', 'Margin Bottom')}
                {this.renderInput('ml', 'Margin Left')}
                {this.renderInput('mr', 'Margin Right')}
                {this.renderInput('width', 'Width')}
                {this.renderInput('height', 'Height')}
                {this.renderInput('numberElements', 'Number of elements')}
                {this.renderInput('once', 'Once', 'checkbox')}
              </Flex>

              <br />
              <strong>
                Elements Visible: {Object.values(visible).filter(x => x).length}
              </strong>
            </div>
          </Sidebar>

          <Content id="content">
            {Array.from({ length: this.state.numberElements }, (x, i) => i).map(
              x => this.renderComponent(x),
            )}
          </Content>
        </Flex>
      </div>
    )
  }
}

export default App
