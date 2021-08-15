'use strict'

const debug = require('debug')('middleware:param')
const { v4: uuidv4 } = require('uuid');

module.exports = class ParamMiddleware {
  async handle(ctx, next) {
    ctx.params.ctxid = uuidv4()

    await this.handleUpStream(ctx)

    await next()

    await this.handleDownStream(ctx)
  }

  async handleUpStream({ request, response, params }) {
    debug('%s -> handleUpStream %O', params.ctxid, request.originalUrl())

    const allParams = request.all() || {}

    // handle multipart field
    const { multipart } = request
    if (multipart) {
      await multipart.field((name, value) => {
        allParams[name] = value
      })
    }

    // params = Object.assign(params, Helpers.parameterize(params, allParams))

    debug('%s handleUpStream -> %O', params.ctxid, params)
  }

  async handleDownStream({ request, response, params, view }) {
    debug('%s -> handleDownStream %O', params.ctxid, request.originalUrl())

    const { lazyBody: { content } } = response

    debug('%s handleDownStream -> %O', params.ctxid, content)

    const ext = request.format()
    if (ext.indexOf('json') > -1) return response.json(content)
    if (ext.indexOf('htm') > -1) return response.send(view.render('plain', { jsonSource: JSON.stringify(content) }))
  }
}
