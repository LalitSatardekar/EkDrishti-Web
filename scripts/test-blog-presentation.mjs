import assert from 'node:assert/strict'
import { blogCard, blogListingHTML } from '../src/lib/blogPresentation.js'
const article = {_id:'one',slug:'choosing-your-photographer',title:'How to Choose the Right Photographer and Videographer',categories:['production'],publishedAt:'2026-10-26',excerpt:'A thoughtful guide to finding the right creative team for the moments that matter.'}
const render = (items, extra={}) => blogListingHTML({listing:{items,total:items.length,page:1,pages:1},...extra})
const one = render([article])
assert.equal(one.split('href="/blogs/choosing-your-photographer"').length-1,1)
assert.ok(one.includes('blog-card-featured'))
assert.ok(one.includes('blog-art-cover'))
assert.ok(!one.includes('Page 1 of 1'))
assert.ok(!one.includes('More to explore'))
const search = render([article],{query:{q:'camera'},categories:[{slug:'production',name:'Production'}]})
assert.ok(search.includes('Results for'))
assert.ok(!search.includes('blog-card-featured'))
assert.ok(search.includes('/blogs/category/production'))
assert.ok(render([],{query:{q:'none'}}).includes('Browse all stories'))
assert.ok(blogCard({...article,title:'<script>alert(1)</script>'}).includes('&lt;script&gt;'))
assert.ok(blogCard({...article,featuredImage:{src:'/logo.png',alt:'Cover'}}).includes('class="blog-card-cover"><img'))
console.log('Blog presentation checks passed.')
if(process.argv.includes('--browser')) {
  const fs=await import('node:fs')
  const {chromium}=await import('../scratch/qa/node_modules/playwright-core/index.mjs')
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true})
  try {
    const page=await browser.newPage()
    const css=fs.readFileSync('src/components/blog/blog.css','utf8')
    for(const width of [1440,390]) {
      await page.setViewportSize({width,height:1000})
      await page.setContent('<html><head><style>body{margin:0;background:#0b1120}*{box-sizing:border-box}'+css+'</style></head><body>'+one+'</body></html>')
      assert.equal(await page.locator('.blog-card').count(),1)
      assert.ok(await page.locator('.blog-card-cover').isVisible())
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow at '+width)
      await page.screenshot({path:'scratch/blog-redesign-'+width+'.png',fullPage:true})
    }
    await page.setContent('<style>'+css+'</style>'+render([article,{...article,_id:'two',slug:'two'},{...article,_id:'three',slug:'three'}]))
    assert.equal(await page.locator('.blog-card').count(),3)
    console.log('Desktop and mobile visual layout checks passed.')
  } finally {await browser.close()}
}
