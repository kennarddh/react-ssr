import React from 'react'

import ReactDOMServer from 'react-dom/server'

import App from './App'
import GlobalStyle from './Styles'

export const Render = () => {
	return ReactDOMServer.renderToString(
		<React.StrictMode>
			<GlobalStyle />
			<App />
		</React.StrictMode>,
	)
}
