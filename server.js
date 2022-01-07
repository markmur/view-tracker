import path from 'path'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { ServerStyleSheet } from 'styled-components'
import express from 'express'
import App from './public/app'

const PORT = 1234

const server = express()

const render = (body, css) => `
  <!DOCTYPE html>
  <html>
    <head>
      <title>View Tracker</title>
      ${css}
    </head>
    <body>
      <div id="root">${body}</div>
      <script src="./demo-server.js"></script>
    </body>
  </html>
`

server.use(express.static(path.resolve(__dirname, 'dist')))

server.get('*', (req, res) => {
  const styleSheet = new ServerStyleSheet()
  const html = renderToString(styleSheet.collectStyles(<App />))
  const css = styleSheet.getStyleTags()

  return res.send(render(html, css))
})

server.listen(PORT, () => {
  console.log(`Server running. http://localhost:${PORT}`)
})
