import React from 'react'

import ReactDOM from 'react-dom/client'

import App from './App'
import GlobalStyle from './Styles'

ReactDOM.hydrateRoot(
	document.getElementById('root') as HTMLElement,
	<React.StrictMode>
		<GlobalStyle />
		<App />
	</React.StrictMode>,
)
console.log('hydrated')
