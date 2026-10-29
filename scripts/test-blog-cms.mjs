import assert from 'node:assert/strict'
import express from 'express'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { runIsolatedCaseChecks } from './test-case-persistence.mjs'
import { createBlogRouter } from '../server_api/v1/blogs.js'
import { blogHTMLHandler } from '../server_api/lib/blogPage.js'
import sitemap from '../server_api/v1/sitemap.js'
import robots from '../server_api/v1/robots.js'
import sharp from 'sharp'
import BlogNotification from '../server_api/models/BlogNotification.js'
import Blog from '../server_api/models/Blog.js'
import BlogCategory from '../server_api/models/BlogCategory.js'
import BlogSettings from '../server_api/models/BlogSettings.js'
import { isBlogPublic, validateBlogInput } from '../server_api/lib/blogValidation.js'
import { blogSEO } from '../src/lib/blogSEO.js'
import { blogArticleHTML } from '../src/lib/blogPresentation.js'
import { blogText, validateBlogDocument, renderBlogDocument, EMPTY_BLOG_DOC, safeBlogURL } from '../src/lib/blogContent.js'

process.env.INDEXNOW_KEY=''
process.env.SEARCH_CONSOLE_ACCESS_TOKEN=''
const text=value=>({type:'paragraph',content:[{type:'text',text:value}]})
const doc={type:'doc',content:[{type:'heading',attrs:{level:2},content:[{type:'text',text:'A thoughtful event'}]},text('Real fixture experience with purposeful planning.'),{type:'paragraph',content:[{type:'text',text:'Planning details',marks:[{type:'bold'},{type:'textStyle',attrs:{color:'#f2a020',fontSize:'24px'}}]}]}]}
const harmful={type:'doc',content:[text('</script><script>alert(1)</script><img src=x onerror=alert(1)>')]}
assert.ok(!renderBlogDocument(harmful).includes('<script>'))
assert.equal(safeBlogURL('/uploads/font</style><script>alert(1)</script>'),'')
assert.ok(!blogArticleHTML({title:'Safe',slug:'safe',document:EMPTY_BLOG_DOC,fonts:[{fontFamily:'Test',fontSource:'custom',fontUrl:'/uploads/font</style><script>alert(1)</script>'}]}).includes('<script>'))
assert.throws(()=>validateBlogDocument({type:'doc',content:[{type:'iframe'}]}))
assert.throws(()=>validateBlogDocument({type:'doc',content:[{type:'text',text:'Invalid root text'}]}))
assert.throws(()=>validateBlogDocument({type:'doc',content:[{type:'image',attrs:{src:'data:image/png;base64,aaa'}}]}))
assert.throws(()=>validateBlogDocument({type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Unsafe',marks:[{type:'link',attrs:{href:'javascript:alert(1)'}}]}]}]}))
assert.equal(isBlogPublic({status:'scheduled',scheduledAt:new Date(Date.now()-1000)}),true)
assert.equal(isBlogPublic({status:'draft',publishedAt:new Date(0)}),false)
assert.equal(isBlogPublic({status:'scheduled',scheduledAt:new Date(Date.now()+100000)}),false)
assert.throws(()=>validateBlogInput({slug:'category',document:EMPTY_BLOG_DOC,status:'draft'}))
assert.throws(()=>validateBlogInput({slug:'valid',document:doc,status:'published',title:'Title',seo:{canonical:'https://evil.example/blogs/valid'}}))
console.log('Blog unit checks passed (schema, unsafe content, URLs, scheduling and canonical policy).')

await runIsolatedCaseChecks(async({app,base,token,project})=>{
  await Promise.all([Blog.init(),BlogCategory.init(),BlogSettings.init(),BlogNotification.init()])
  app.use('/v1',createBlogRouter());app.get(/^\/blogs(?:\/.*)?$/,blogHTMLHandler);app.get('/sitemap.xml',sitemap);app.get('/robots.txt',robots);app.use(express.static('dist'));app.use(express.static('public'))
  const api=async(path,{method='GET',body,auth=true,status=200}={})=>{const response=await fetch(base+'/v1/'+path,{method,headers:{'Content-Type':'application/json',...(auth?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});const data=await response.json();assert.equal(response.status,status,data.message||path);return data.data}
  await api('admin/blogs',{auth:false,status:401})
  await api('admin/blogs',{method:'POST',auth:false,body:{},status:401})
  const imported=await api('admin/blog-import',{method:'POST',body:{html:'<h2>Imported</h2><script>alert(1)</script><a href="javascript:alert(2)">Unsafe</a><img src="data:image/png;base64,test" onerror="alert(3)">'}});assert.ok(!imported.html.includes('<script')&&!imported.html.includes('javascript:')&&!imported.html.includes('onerror')&&!imported.html.includes('data:image'))
  let article=await api('admin/blogs',{method:'POST',body:{title:'Event planning guide',slug:'event-planning-guide',document:doc,excerpt:'A useful planning fixture.',categories:['events'],author:{name:'QA Writer',slug:'qa-writer',bio:'An isolated test profile.'},faq:{enabled:true,heading:'Practical questions',items:[{id:'faq-one',question:'How do we prepare?',answer:{type:'doc',content:[text('Start with clear expectations.')]},enabled:true}]},seo:{title:'Event planning | Ekdrishti Studios',description:'A complete fixture description.'}},status:201})
  assert.equal(article.status,'draft')
  await api('blogs/'+article.slug,{auth:false,status:404})
  let response=await fetch(base+'/blogs/'+article.slug);assert.equal(response.status,404);assert.ok(!(await response.text()).includes('Real fixture experience'))
  await api('admin/blogs',{method:'POST',body:{...article},status:409})
  const beforeVersion=article.__v
  article=await api('admin/blogs/'+article._id,{method:'PUT',body:{...article,version:article.__v,status:'published'}})
  await api('admin/blogs/'+article._id,{method:'PUT',body:{...article,version:beforeVersion,title:'Stale write'},status:409})
  const published=await api('blogs/'+article.slug,{auth:false});assert.equal(published.article.title,article.title)
  response=await fetch(base+'/blogs/'+article.slug);assert.equal(response.status,200);let html=await response.text()
  for(const expected of ['A thoughtful event','Real fixture experience','How do we prepare?','Start with clear expectations.','QA Writer','rel="canonical"','BlogPosting','BreadcrumbList'])assert.ok(html.includes(expected),'Initial HTML contains '+expected)
  assert.equal((html.match(/<meta[^>]*name="description"/g)||[]).length,1)
  assert.equal((html.match(/rel="canonical"/g)||[]).length,1)
  assert.equal((html.match(/<title/g)||[]).length,1)
  const json=[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match=>JSON.parse(match[1]));assert.equal(json.length,2)
  const previousVercel=process.env.VERCEL;process.env.VERCEL='1';const {default:vercelAdapter}=await import('../api/index.js');if(previousVercel==null)delete process.env.VERCEL;else process.env.VERCEL=previousVercel
  app.all('/vercel-index',vercelAdapter);response=await fetch(base+'/vercel-index?__app_path='+encodeURIComponent('/blogs/'+article.slug));assert.equal(response.status,200);assert.ok((await response.text()).includes('Real fixture experience'),'The serverless adapter preserves the rewritten original article path')
  let xml=await(await fetch(base+'/sitemap.xml')).text();assert.ok(xml.includes('/blogs/'+article.slug));assert.ok(xml.includes('/work/'+project.slug))
  article=await api('admin/blogs/'+article._id,{method:'PUT',body:{...article,version:article.__v,slug:'revised-event-guide'}})
  await api('admin/blogs/'+article._id,{method:'PUT',body:{...article,version:article.__v,slug:'event-planning-guide'},status:409})
  response=await fetch(base+'/blogs/event-planning-guide',{redirect:'manual'});assert.equal(response.status,301);assert.equal(response.headers.get('location'),'/blogs/revised-event-guide')
  await api('admin/blogs',{method:'POST',body:{title:'Collision',slug:'event-planning-guide'},status:409})
  const copied=await api('admin/blogs/'+article._id+'/duplicate',{method:'POST',status:201});assert.equal(copied.status,'draft');assert.notEqual(copied.faq.items[0].id,article.faq.items[0].id)
  const updatedCopy=await api('admin/blogs/'+copied._id,{method:'PUT',body:{...copied,version:copied.__v,faq:{...copied.faq,items:[{...copied.faq.items[0],question:'Independent question'}]}}});assert.equal((await api('admin/blogs/'+article._id)).faq.items[0].question,'How do we prepare?')
  let scheduled=await api('admin/blogs',{method:'POST',body:{title:'Scheduled fixture',slug:'scheduled-fixture',document:doc},status:201})
  scheduled=await api('admin/blogs/'+scheduled._id,{method:'PUT',body:{...scheduled,version:scheduled.__v,status:'scheduled',scheduledAt:new Date(Date.now()+3600000).toISOString()}});await api('blogs/'+scheduled.slug,{auth:false,status:404})
  await Blog.updateOne({_id:scheduled._id},{$set:{scheduledAt:new Date(Date.now()-1000)}})
  assert.equal((await api('blogs/'+scheduled.slug,{auth:false})).article.status,'published','Timestamp eligibility works without timers or process memory')
  assert.ok((await api('admin/blogs?status=published')).items.some(item=>item._id===scheduled._id&&item.effectiveStatus==='published'),'The owner dashboard recognizes elapsed schedules as published')
  article=await api('admin/blogs/'+article._id,{method:'PUT',body:{...article,version:article.__v,seo:{...article.seo,noindex:true}}});xml=await(await fetch(base+'/sitemap.xml')).text();assert.ok(!xml.includes('/blogs/'+article.slug))
  article=await api('admin/blogs/'+article._id+'/unpublish',{method:'POST',body:{version:article.__v}});await api('blogs/'+article.slug,{auth:false,status:404})
  const revisions=await api('admin/blogs/'+article._id+'/revisions');assert.ok(revisions.length>=3)
  article=await api('admin/blogs/'+article._id+'/restore/'+revisions.at(-1)._id,{method:'POST',body:{version:article.__v}});assert.equal(article.status,'draft');assert.deepEqual(article.document,doc);assert.equal(article.slug,'revised-event-guide','Revision restore retains the current canonical route')
  await api('admin/blogs/'+article._id,{method:'PUT',body:{...article,version:article.__v,document:{type:'doc',content:[{type:'script'}]}},status:400})
  await assert.rejects(new Blog({slug:'invalid-model',slugs:['invalid-model'],document:{type:'doc',content:[{type:'script'}]}}).validate())
  await api('admin/blogs/'+updatedCopy._id,{method:'PUT',body:{...updatedCopy,version:updatedCopy.__v,status:'archived'}})
  await api('blogs/'+updatedCopy.slug,{auth:false,status:404})
  await api('admin/blog-categories/creative-process',{method:'PUT',body:{name:'Creative Process',description:'Meaningful original work.'}})
  let config=await api('admin/blog-settings');config=await api('admin/blog-settings',{method:'PUT',body:{...config,config:{...config.config,title:'A saved journal title',perPage:1,defaultCTA:{enabled:true,label:'Talk to the studio',heading:'Create with us',href:'/contact'}}}});assert.equal((await api('admin/blog-settings')).config.title,'A saved journal title')
  assert.equal((await api('admin/blogs/'+article._id)).cta.enabled,false,'Settings changes do not silently restyle existing article snapshots')
  const pageOne=await api('admin/blogs?limit=1&page=1');assert.ok(pageOne.pages>=3);assert.equal(pageOne.items.length,1)
  const pageTwo=await api('admin/blogs?limit=1&page=2');assert.notEqual(pageTwo.items[0]._id,pageOne.items[0]._id)
  assert.equal((await api('blogs?q=unfindablefixture',{auth:false})).total,0)
  response=await fetch(base+'/blogs/category/creative-process');assert.equal(response.status,404,'Empty public categories are not thin indexable pages')
  const insight=await api('admin/blog-insights');assert.equal(insight.searchConsole.connected,false)
  const previousEnvironment=process.env.NODE_ENV;process.env.NODE_ENV='production';const robotsText=await(await fetch(base+'/robots.txt')).text();process.env.NODE_ENV=previousEnvironment;assert.ok(robotsText.includes('Allow: /')&&robotsText.includes('Disallow: /ownercontrols_panel/')&&!robotsText.includes('Disallow: /blogs'))
  assert.ok(await BlogNotification.countDocuments({state:'pending'})>0,'Publication events persist in the durable outbox')
  assert.equal((await api('admin/blog-indexnow',{method:'POST'})).connected,false)
  const longDocument={type:'doc',content:Array.from({length:800},(_,index)=>text('Paragraph '+index+' '+('Useful original writing. '.repeat(30))))}
  const started=performance.now();validateBlogDocument(longDocument);renderBlogDocument(longDocument);console.log('Long article validation/render benchmark: '+Math.round(performance.now()-started)+'ms for 800 paragraphs.')
  console.log('Blog integration checks passed (authorization, persistence, revisions, concurrency, scheduling, redirects, initial HTML, sitemap, settings and pagination).')
  if(process.env.BLOG_BROWSER!=='true')return
  const {chromium}=await import('../scratch/qa/node_modules/playwright-core/index.mjs');let vite,browser
  try{
    vite=await createServer({configFile:false,root:process.cwd(),plugins:[react()],server:{host:'127.0.0.1',port:3100,strictPort:true,proxy:{'/v1':{target:base}}}});await vite.listen()
    browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true})
    const context=await browser.newContext({viewport:{width:1440,height:1000}});await context.addInitScript(token=>{localStorage.setItem('token',token);localStorage.setItem('user',JSON.stringify({username:'isolated-cms-qa',role:'admin'}))},token)
    const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));page.setDefaultTimeout(20000)
    await page.goto('http://127.0.0.1:3100/ownercontrols_panel/blogs/'+article._id)
    await page.getByLabel('Article title',{exact:true}).waitFor();await page.getByLabel('Autosave drafts',{exact:true}).uncheck()
    await page.getByLabel('Article title',{exact:true}).fill('Browser written article')
    const editor=page.getByRole('textbox',{name:'Article body',exact:true});await editor.click();await page.keyboard.press('Control+End');await page.keyboard.press('Enter');await page.keyboard.type('A new paragraph written through the editor.')
    await page.getByRole('combobox',{name:'Paragraph or heading',exact:true}).selectOption('h3');assert.ok(await editor.locator('h3').count()>0)
    await editor.locator('h3').last().click();await page.keyboard.press('End');await page.keyboard.press('Control+Shift+ArrowLeft');if(await page.getByRole('button',{name:'Bold',exact:true}).getAttribute('aria-pressed')!=='true')await page.getByRole('button',{name:'Bold',exact:true}).click();if(await page.getByRole('button',{name:'Italic',exact:true}).getAttribute('aria-pressed')!=='true')await page.getByRole('button',{name:'Italic',exact:true}).click()
    assert.ok(await editor.locator('strong em,em strong').count()>0,'Overlapping marks apply to the selected word')
    await page.getByText('Typography, tables & media',{exact:true}).click()
    await page.getByRole('button',{name:'Insert table',exact:true}).click();assert.equal(await editor.locator('table').count(),1)
    await page.getByRole('button',{name:'Delete table',exact:true}).click()
    const png=await sharp({create:{width:160,height:100,channels:3,background:'#224466'}}).png().toBuffer()
    await page.getByLabel('Insert article images',{exact:true}).setInputFiles({name:'blog-inline-qa-'+Date.now()+'.png',mimeType:'image/png',buffer:png})
    await editor.locator('img').waitFor();await editor.locator('img').click();await page.getByLabel('Inline image alt',{exact:true}).fill('A meaningful inline fixture')
    await page.getByLabel('Inline image caption',{exact:true}).fill('A real upload through the existing pipeline.')
    const beforeUndoImages=await editor.locator('img').count();await page.getByRole('button',{name:'Undo',exact:true}).click();await page.getByRole('button',{name:'Redo',exact:true}).click();assert.equal(await editor.locator('img').count(),beforeUndoImages)
    await page.getByLabel('Replace inline image',{exact:true}).setInputFiles({name:'blog-replacement-qa-'+Date.now()+'.png',mimeType:'image/png',buffer:png});await page.waitForTimeout(300);assert.equal(await editor.locator('img').count(),1)
    const featured=page.locator('.studio-inspector > details').filter({has:page.locator('summary').getByText('Featured image',{exact:true})}).first();await featured.locator('summary').first().click();await page.getByLabel('Upload featured image',{exact:true}).setInputFiles({name:'blog-featured-qa-'+Date.now()+'.png',mimeType:'image/png',buffer:png});await featured.locator('img').waitFor();await page.getByLabel('Featured image alt',{exact:true}).fill('Featured fixture photograph');await page.getByLabel('Featured focal X',{exact:true}).fill('28')
    const faqDetails=page.locator('.studio-inspector > details').filter({has:page.locator('summary').getByText('Article FAQs',{exact:true})}).first();await faqDetails.locator('summary').first().click();await page.getByLabel('Enable article FAQs',{exact:true}).check();await page.getByRole('button',{name:'Add question',exact:true}).click();await page.getByLabel('FAQ question 2',{exact:true}).fill('A browser-created question?');const answer=page.getByRole('textbox',{name:'FAQ answer 2',exact:true});await answer.fill('A browser-created answer with useful information.');await page.getByRole('button',{name:'Move FAQ 2 earlier',exact:true}).click()
    await page.getByRole('button',{name:'Save changes',exact:true}).click();await page.waitForFunction(()=>!document.body.textContent.includes('Unsaved changes'))
    await page.getByRole('button',{name:'Preview',exact:true}).click();await page.getByRole('dialog',{name:'Private article preview',exact:true}).getByRole('heading',{name:'Browser written article',exact:true}).waitFor();await page.getByRole('button',{name:'Close preview',exact:true}).click()
    await page.getByRole('button',{name:'Publish now',exact:true}).click();await page.waitForTimeout(1200)
    const savedArticle=await api('admin/blogs/'+article._id);assert.equal(savedArticle.title,'Browser written article');assert.ok(blogText(savedArticle.document).includes('A new paragraph'));assert.equal(savedArticle.featuredImage.focalX,28);assert.equal(savedArticle.faq.items[0].question,'A browser-created question?');assert.ok(JSON.stringify(savedArticle.document).includes('A meaningful inline fixture'))
    for(const width of [1440,900,390]){await page.setViewportSize({width,height:1000});await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Editor has no overflow at '+width)}
    await page.reload();await page.getByLabel('Article title',{exact:true}).waitFor();assert.equal(await page.getByLabel('Article title',{exact:true}).inputValue(),'Browser written article')
    const draftFixture=await api('admin/blogs',{method:'POST',body:{title:'Autosave fixture',slug:'autosave-fixture',document:doc},status:201})
    const recoveryPage=await context.newPage();recoveryPage.on('dialog',dialog=>dialog.accept());await recoveryPage.goto('http://127.0.0.1:3100/ownercontrols_panel/blogs/'+draftFixture._id);await recoveryPage.getByLabel('Article title',{exact:true}).fill('Automatically saved draft')
    await recoveryPage.waitForResponse(response=>response.url().includes('/v1/admin/blogs/'+draftFixture._id)&&response.request().method()==='PUT'&&response.status()===200)
    assert.equal((await api('admin/blogs/'+draftFixture._id)).title,'Automatically saved draft')
    await recoveryPage.getByLabel('Autosave drafts',{exact:true}).uncheck();await recoveryPage.getByLabel('Article title',{exact:true}).fill('Locally recoverable edit');await recoveryPage.waitForFunction(id=>JSON.parse(sessionStorage.getItem('blog-recovery:'+id)||'{}').title==='Locally recoverable edit',draftFixture._id)
    await recoveryPage.reload();await recoveryPage.getByRole('button',{name:'Recover local edits for review',exact:true}).click();assert.equal(await recoveryPage.getByLabel('Article title',{exact:true}).inputValue(),'Locally recoverable edit')
    await recoveryPage.route('**/v1/admin/blogs/'+draftFixture._id,route=>route.request().method()==='PUT'?route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({success:false,message:'Simulated connection failure'})}):route.continue());await recoveryPage.getByRole('button',{name:'Save changes',exact:true}).click();await recoveryPage.getByRole('alert').getByText('Simulated connection failure',{exact:true}).waitFor();assert.equal(await recoveryPage.getByLabel('Article title',{exact:true}).inputValue(),'Locally recoverable edit');await recoveryPage.unroute('**/v1/admin/blogs/'+draftFixture._id);await recoveryPage.getByRole('button',{name:'Save changes',exact:true}).click();await recoveryPage.waitForResponse(response=>response.url().includes('/v1/admin/blogs/'+draftFixture._id)&&response.request().method()==='PUT'&&response.status()===200);await recoveryPage.close()
    const longFixture=await api('admin/blogs',{method:'POST',body:{title:'Long document fixture',slug:'long-document-fixture',document:longDocument},status:201})
    const longPage=await context.newPage(),longStart=performance.now();await longPage.goto('http://127.0.0.1:3100/ownercontrols_panel/blogs/'+longFixture._id);await longPage.getByRole('textbox',{name:'Article body',exact:true}).waitFor();await longPage.getByRole('textbox',{name:'Article body',exact:true}).locator('p').last().click();await longPage.keyboard.press('End');await longPage.keyboard.type(' End of long fixture.');console.log('Long editor load plus interaction: '+Math.round(performance.now()-longStart)+'ms for 800 paragraphs.');await longPage.close()
    const noJS=await browser.newContext({javaScriptEnabled:false});const crawler=await noJS.newPage();await crawler.goto(base+'/blogs/'+savedArticle.slug);await crawler.getByRole('heading',{name:'Browser written article',exact:true}).waitFor();await crawler.getByText('Real fixture experience with purposeful planning.',{exact:true}).waitFor();await noJS.close()
    const publicPage=await context.newPage();await publicPage.goto('http://127.0.0.1:3100/blogs/'+savedArticle.slug);await publicPage.getByRole('heading',{name:'Browser written article',exact:true}).waitFor();assert.equal(await publicPage.locator('head link[rel=canonical]').count(),1);assert.equal(await publicPage.locator('head meta[name=description]').count(),1)
    await publicPage.setViewportSize({width:390,height:900});assert.equal(await publicPage.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false)
    await page.screenshot({path:'scratch/qa/blog-editor-mobile.png',fullPage:true});await publicPage.screenshot({path:'scratch/qa/blog-article-mobile.png',fullPage:true})
    assert.deepEqual(errors,[]);console.log('Blog browser checks passed (writing, headings, preview, publish, reload, responsive editor, metadata deduplication and JavaScript-disabled article).')
  }finally{await browser?.close();await vite?.close()}
})
