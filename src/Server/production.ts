import express, { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import ReactDOMServer from 'react-dom/server'
import { ServerStyleSheet } from 'styled-components'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const GenerateHTML = async () => {
	// Read index.html
	const template = fs.readFileSync(
		path.resolve(__dirname, '../../build/client/index.html'),
		'utf-8',
	)

	// EntryServ = EntryServer
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	// eslint-disable-next-line import/no-unresolved
	const EntryServ = await import('../../build/server/EntryServer.js')

	const EntryJSX = EntryServ.EntryJSX as () => unknown

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

	return html
}

const CreateServer = async () => {
	const app = express()

	const html = await GenerateHTML()

	app.use(
		express.static(path.resolve(__dirname, '../../build/client/'), {
			index: false,
		}),
	)

	app.use('*', async (req: Request, res: Response, next: NextFunction) => {
		try {
			res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
		} catch (error) {
			next(error)
		}
	})

	app.listen(5173, () => {
		console.log('Alive')
	})
}

CreateServer()
