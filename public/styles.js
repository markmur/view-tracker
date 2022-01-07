/* eslint-disable no-unused-expressions */

import React from 'react'
import styled, { injectGlobal } from 'styled-components'

injectGlobal`
  html, body {
    background: #f4f4f7;
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-family: -apple-system, Helvetica;
    line-height: 1.35;
  }

  * {
    box-sizing: border-box
  }
`

const DEFAULT_BOX_SIZE = '200px'
const SIDEBAR_WIDTH = 320

const createMarginOptions = (
  directions = ['top', 'right', 'bottom', 'left'],
) => p => {
  const rules = directions.map(
    direction => `margin-${direction}: ${p[`m${direction[0]}`] || 0};`,
  )

  return rules
}

const rule = (key, fallback, unit = '') => p => `${p[key] || fallback}${unit}`

export const Flex = styled.div.attrs({
  wrap: true,
})`
  display: flex;
  flex-wrap: ${p => (p.wrap ? 'wrap' : 'nowrap')};
`

export const InputContainer = styled.div`
  flex: 1 0 calc(50% - 10px);
  max-width: calc(50% - 10px);
  padding: 5px;
`

export const Input = styled.input`
  max-width: 100%;
  box-sizing: border-box;
`

export const Title = styled.h3`
  margin-bottom: 1em;
  font-size: 18px;
  color: #1a1a1a;
`

export const Sidebar = styled.aside`
  background: white;
  height: 100vh;
  left: 0;
  top: 0;
  padding-top: 1em;
  flex: 0 1 ${p => (p.open ? `${SIDEBAR_WIDTH}px` : `0px`)};
  width: ${p => (p.open ? `${SIDEBAR_WIDTH}px` : `0px`)};
  font-family: Helvetica, sans-serif;
  transform: translateX(${p => (p.open ? '0' : '-100%')});
  will-change: transform;
  transition: transform 250ms ease-in-out;

  & > * {
    opacity: ${p => (p.open ? 1 : 0)};
  }

  label {
    display: block;
    margin-bottom: 5px;
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 1px;
  }

  input {
    margin-bottom: 2em;
    padding: 1em;
    border-radius: 4px;
    border: 1px solid #eee;
  }
`

export const Content = styled.div`
  flex: 1;
  height: 100vh;
  overflow-y: auto;
`

export const Box = styled.div`
  position: relative;
  color: white;
  padding: 2em;
  font-size: 14px;
  width: ${rule('width', DEFAULT_BOX_SIZE)};
  height: ${rule('height', DEFAULT_BOX_SIZE)};
  background: ${rule('color', 'black')};
  ${createMarginOptions()};
`

export const Code = styled.pre`
  background: #f4f4f7;
  color: hotpink;
  white-space: nowrap;
  border-radius: 4px;
  font-weight: bold;
  margin-bottom: 2em;
  padding: 1em;
  max-width: 240px;
  overflow-x: auto;
`

export const HighlightedBorder = styled.div`
  position: absolute;
  top: -${p => p.errorMargin || 0}px;
  left: -${p => p.errorMargin || 0}px;
  height: calc(100% + ${p => (p.errorMargin || 0) * 2}px);
  width: calc(100% + ${p => (p.errorMargin || 0) * 2}px);
  border: ${p => p.errorMargin || 0}px solid rgba(255, 0, 0, 0.2);
`

export const MenuIcon = styled(({ className = '', onClick, size = 25 }) => (
  <svg
    x="0"
    y="0"
    width={size}
    height={size}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    className={className}
    onClick={onClick}
  >
    <path
      fill="#000000"
      d="M16.4,9H3.6C3.048,9,3,9.447,3,10c0,0.553,0.048,1,0.6,1h12.8c0.552,0,0.6-0.447,0.6-1S16.952,9,16.4,9z   M16.4,13H3.6C3.048,13,3,13.447,3,14c0,0.553,0.048,1,0.6,1h12.8c0.552,0,0.6-0.447,0.6-1S16.952,13,16.4,13z M3.6,7h12.8  C16.952,7,17,6.553,17,6s-0.048-1-0.6-1H3.6C3.048,5,3,5.447,3,6S3.048,7,3.6,7z"
    />
  </svg>
))`
  position: absolute;
  top: 1.25em;
  left: 2em;
  cursor: pointer;
  z-index: 10000;
`
