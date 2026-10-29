import assert from 'node:assert/strict'
import { getSortedCases } from '../src/lib/sortingEngine.js'
const item = (slug, values={}) => ({ slug, status: 'published', service: 'family-events', featured: true, ...values })
const cases = [item('z', {priority: 10}), item('b', {priority: 90}), item('a', {priority: 90}), item('missing'), item('draft', {status:'draft',priority:100}), item('archived', {status:'archived'}), item('other', {service:'production'}), item('regular', {featured:false,priority:95})]
const home = getSortedCases(cases, {service:'events',featured:true})
assert.deepEqual(home.map(x=>x.slug), ['a','b','z','missing'])
assert.deepEqual(getSortedCases(cases,{service:'family-events'}).map(x=>x.slug), ['regular','a','b','z','missing'])
assert.equal(getSortedCases(cases,{service:'production',featured:true})[0].slug,'other')
assert.deepEqual(getSortedCases([item('zero',{priority:0}), item('missing')]).map(x=>x.slug),['zero','missing'])
assert.equal(getSortedCases([item('deleted',{deleted_at:'2026-01-01'})]).length,0)
assert.equal(getSortedCases(cases,{service:'digital-marketing',featured:true}).length,0)
assert.equal(cases[0].slug,'z')
console.log('Portfolio filtering, publication, priority, stable ties, missing priority, aliases, empty states and immutability passed.')
