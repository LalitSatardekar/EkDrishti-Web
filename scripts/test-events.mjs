import assert from 'node:assert/strict'
import { validateEvent } from '../server_api/lib/eventValidation.js'
import handler from '../server_api/v1/events.js'

const valid = { title: 'Expo', image: 'https://example.com/banner.png', date: '2026-12-10', category: 'upcoming', layout: 'banner', published: false }
assert.equal(validateEvent(valid).published, false)
assert.equal(validateEvent({ ...valid, category: 'covered', layout: 'square' }).layout, 'square')
for (const change of [{ title: '' }, { image: 'javascript:alert(1)' }, { image: '//example.com/image' }, { category: 'service' }, { layout: 'invalid' }, { date: '2026-02-30' }, { published: 'false' }]) {
  assert.throws(() => validateEvent({ ...valid, ...change }))
}
function response() {
  return { code: 200, headers: {}, setHeader(key, value) { this.headers[key] = value }, status(code) { this.code = code; return this }, json(body) { this.body = body; return this } }
}
for (const method of ['POST', 'PUT', 'DELETE']) {
  const res = response()
  await handler({ method, headers: {}, query: {} }, res)
  assert.equal(res.code, 401, `${method} must require authentication`)
}
const admin = response()
await handler({ method: 'GET', headers: {}, query: { admin: '1' } }, admin)
assert.equal(admin.code, 401, 'Draft listing requires authentication')
const unsupported = response()
await handler({ method: 'PATCH', headers: {}, query: {} }, unsupported)
assert.equal(unsupported.code, 405)
console.log('Events validation and authentication checks passed.')
