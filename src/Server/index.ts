import { createServer as createViteServer } from 'vite'

import express, { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
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
			// 1. Read index.html
			let template = fs.readFileSync(
				path.resolve(__dirname, '../Client/index.html'),
				'utf-8',
			)

			// 2. Apply Vite HTML transforms. This injects the Vite HMR client,
			//    and also applies HTML transforms from Vite plugins, e.g. global
			//    preambles from @vitejs/plugin-react
			template = await vite.transformIndexHtml(url, template)

			// 3. Load the server entry. ssrLoadModule automatically transforms
			//    ESM source code to be usable in Node.js! There is no bundling
			//    required, and provides efficient invalidation similar to HMR.
			const { Render } = await vite.ssrLoadModule(
				path.join(__dirname, '../Client/EntryServer.tsx'),
			)

			// 4. render the app HTML. This assumes entry-server.js's exported
			//     `render` function calls appropriate framework SSR APIs,
			//    e.g. ReactDOMServer.renderToString()
			const appHtml = await Render(url)

			// 5. Inject the app-rendered HTML into the template.
			const html = template.replace('<!--ssr-outlet-->', appHtml)

			// 6. Send the rendered HTML back.
			res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
		} catch (e) {
			// If an error is caught, let Vite fix the stack trace so it maps back
			// to your actual source code.
			vite.ssrFixStacktrace(e as Error)
			next(e)
		}
	})

	app.listen(5173)
}

// eslint-disable-next-line jest/require-hook
createServer()