import fs from 'node:fs'
import path from 'node:path'
import Blog from '../models/Blog.js'
import { connectToDatabase } from './db.js'
import { getBlogSettings, getBlogCategories, blogListing, findPublicArticle } from './blogService.js'
import { publicBlogFilter, apiError } from './blogValidation.js'
import { BLOG_ORIGIN, blogSEO, blogHead, jsonScript } from '../../src/lib/blogSEO.js'
import { blogArticleHTML, blogListingHTML } from '../../src/lib/blogPresentation.js'
export async function blogPageData(url){
  const request=new URL(url,BLOG_ORIGIN),pathname=request.pathname,query=Object.fromEntries(request.searchParams)
  if(!/^\/blogs(?:\/(?:[a-z0-9-]+|category\/[a-z0-9-]+|author\/[a-z0-9-]+))?\/?$/.test(pathname))throw apiError('Page not found.',404)
  if(pathname.endsWith('/'))return {redirect:pathname.slice(0,-1)+request.search,status:301}
  await connectToDatabase()
  const {config:settings}=await getBlogSettings(),categories=await getBlogCategories()
  const parts=pathname.split('/').filter(Boolean)
  if(parts.length===2){const article=await findPublicArticle(parts[1]);if(article.slug!==parts[1])return {redirect:'/blogs/'+article.slug,status:301};const related=await Blog.find({...publicBlogFilter(),_id:{$ne:article._id},$and:[{$or:[{categories:{$in:article.categories||[]}},{topicCluster:article.topicCluster||'__none__'}]}]}).select('title slug excerpt featuredImage categories publishedAt').limit(3).lean();return {kind:'article',article,settings,related,meta:{...blogSEO(article,settings),article:true},path:pathname}}
  let category,author
  if(parts[1]==='category'){category=categories.find(item=>item.slug===parts[2]);if(!category)throw apiError('Category not found.',404);query.category=category.slug}
  if(parts[1]==='author'){const article=await Blog.findOne({...publicBlogFilter(),'author.slug':parts[2],'author.bio':{$ne:''}}).select('author').lean();if(!article?.author?.bio)throw apiError('Author profile not found.',404);author=article.author;query.author=author.slug}
  const listing=await blogListing(query)
  if((category||author)&&!listing.total||listing.page>listing.pages)throw apiError('Page not found.',404)
  const canonical=BLOG_ORIGIN+pathname+(listing.page>1?'?page='+listing.page:'')
  const featuredArticle=listing.page===1&&!query.q&&!category&&!author?await Blog.findOne({...publicBlogFilter(),$and:[{$or:[{featured:true},{_id:{$in:(settings.featuredIds||[]).filter(id=>/^[a-f0-9]{24}$/i.test(id))}}]}]}).select('title slug excerpt featuredImage categories publishedAt featured').sort({publishedAt:-1}).lean():null
  return {kind:'listing',featuredArticle,listing,settings,categories,query,category,author,path:pathname,meta:{title:category?.seoTitle||category?.name||author?.name||settings.title,description:category?.metaDescription||category?.description||author?.bio||settings.intro,canonical,robots:query.q?'noindex, follow':'index, follow'}}
}
export const blogPageBody=data=>data.kind==='article'?blogArticleHTML(data.article,data.settings,data.related):blogListingHTML(data)
export async function blogHTMLHandler(req,res){
  res.setHeader('Cache-Control','no-store');res.setHeader('Vary','Accept')
  try {
    const data=await blogPageData(req.originalUrl||req.url)
    if(data.redirect)return res.redirect(data.status,data.redirect)
    const dev=process.env.NODE_ENV!=='production'&&req.headers['x-blog-dev']==='1'
    const template=path.join(process.cwd(),dev?'index.html':'dist/index.html')
    if(!fs.existsSync(template))throw apiError('Build the frontend before serving Blog HTML.',503)
    let html=fs.readFileSync(template,'utf8').replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi,'').replace(/<meta\b[^>]*(?:name|property)=["'](?:title|description|keywords|author|robots|og:[^"']*|twitter:[^"']*)["'][^>]*>/gi,'').replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi,'')
    const css=fs.readFileSync(path.join(process.cwd(),'src/components/blog/blog.css'),'utf8')
    const nav='<header class="blog-server-nav"><div><a href="/about">About</a><a href="/blogs">Blogs</a><a href="/services/family-events">Events</a></div><a href="/"><img src="/logo.png" alt="Ekdrishti"></a><div><a href="/services">Services</a><a href="/work">Work</a><a href="/contact">Contact</a></div></header>'
    html=html.replace('</head>',blogHead(data.meta)+`<style>body{margin:0;background:#0b1120}${css}</style></head>`).replace('<div id="root"></div>',`<div id="root">${nav}<main>${blogPageBody(data)}</main><footer class="blog-server-footer"><a href="/blogs">Journal</a><a href="/work">Our work</a><a href="/contact">Contact Ekdrishti Studios</a></footer></div><script id="blog-bootstrap" type="application/json">${jsonScript(data)}</script>`)
    res.status(200).type('html').send(html)
  } catch(error){const status=error.status||503;res.setHeader('X-Robots-Tag','noindex, nofollow');res.status(status).type('html').send('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><title>Journal — Ekdrishti Studios</title></head><body style="background:#0b1120;color:#e5e7eb;font-family:Arial;padding:60px"><main><h1>'+ (status===404?'Article or page not found':'Journal temporarily unavailable')+'</h1><p>'+(status===404?'This page may be unpublished or unavailable.':'Please try again shortly.')+'</p><a href="/blogs" style="color:#f2a020">Return to the journal</a></main></body></html>')}
}
