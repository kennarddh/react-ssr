import { createServer as createViteServer } from 'vite'

import express, { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import ReactDOMServer from 'react-dom/server'
import { ServerStyleSheet } from 'styled-components'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function createServer() {
	const app = express()

	// Create Vite server in middleware mode and configure the app type as
	// 'custom', disabling Vite's own HTML serving logic so parent server
	// can take control
	const vite = await createViteServer({
		server: { middlewareMode: true },
		appType: 'custom',
	})

	// Use vite's connect instance as middleware. If you use your own
	// express router (express.Router()), you should use router.use
	app.use(vite.middlewares)

	app.use('*', async (req: Request, res: Response, next: NextFunction) => {
		const url = req.originalUrl

		try {
			// Read index.html
			let template = fs.readFileSync(
				path.resolve(__dirname, '../../index.html'),
				'utf-8',
			)

			/**
			 * Apply Vite HTML transforms. This injects the Vite HMR client,
			 *    and also applies HTML transforms from Vite plugins, e.g. global
			 *  preambles from @vitejs/plugin-react
			 */
			template = await vite.transformIndexHtml(url, template)

			/**
			 * Load the server entry. ssrLoadModule automatically transforms
			 * ESM source code to be usable in Node.js! There is no bundling
			 * required, and provides efficient invalidation similar to HMR.
			 */
			const { EntryJSX } = await vite.ssrLoadModule(
				path.join(__dirname, '../Client/EntryServer.tsx'),
			)

			// Build styled-componets css
			const sheet = new ServerStyleSheet()
			const styledAppliedJSX = sheet.collectStyles(EntryJSX())

			// Refactor https://styled-components.com/docs/advanced#streaming-rendering to use response streaming
			/**
			 * Don't refactor to get all styles and then render because it won't work
			 * https://styled-components.com/docs/advanced#example See this note
			 * sheet.getStyleTags() and sheet.getStyleElement() can only be called after your element is rendered.
			 */
			const appHtml = ReactDOMServer.renderToString(styledAppliedJSX)
			const styleTags = sheet.getStyleTags()
			sheet.seal()

			// Inject the app-rendered HTML into the template.
			let html = template.replace('<!--ssr-outlet-->', appHtml)

			// Inject styles into the template
			html = html.replace('<!--styles-outlet-->', styleTags)

			//  Send the rendered HTML
			res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
		} catch (error) {
			// If an error is caught, let Vite fix the stack trace so it maps back
			// to your actual source code.
			vite.ssrFixStacktrace(error as Error)

			next(error)
		}
	})

	app.listen(5173)
}

createServer()
