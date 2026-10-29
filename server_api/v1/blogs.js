import BlogNotification from '../models/BlogNotification.js'
import { sanitizeBlogImport } from '../lib/blogSanitize.js'
import { enqueueBlogChange, flushBlogNotifications, indexNowConfigured } from '../lib/blogIndexNow.js'
import { blogPageData } from '../lib/blogPage.js'
import express from 'express'
import mongoose from 'mongoose'
import { verifyToken } from '../lib/auth.js'
import { connectToDatabase } from '../lib/db.js'
import Blog from '../models/Blog.js'
import BlogRevision from '../models/BlogRevision.js'
import BlogSettings from '../models/BlogSettings.js'
import BlogCategory from '../models/BlogCategory.js'
import { blogText, EMPTY_BLOG_DOC, blogGuidance } from '../../src/lib/blogContent.js'
import { validateBlogInput, validateBlogSettings, publicBlogFilter, apiError, slugField, stringField, safeImage, DEFAULT_BLOG_SETTINGS } from '../lib/blogValidation.js'
import { blogListing, findPublicArticle, getBlogCategories, getBlogSettings } from '../lib/blogService.js'

const endpoint=fn=>async(req,res)=>{try{await connectToDatabase();await Promise.all([Blog.init(),BlogRevision.init(),BlogNotification.init()]);await fn(req,res)}catch(error){const status=error.code===11000?409:error.status||((error.name==='ValidationError'||error.name==='CastError')?400:500);res.status(status).json({success:false,message:error.code===11000?'That slug is already reserved by an article or its redirect history.':status===500?'Blog service temporarily unavailable. Your edits have not been discarded.':error.message})}}
const ok=(res,data,status=200)=>res.status(status).json({success:true,data})
const admin=(req,res,next)=>{const token=String(req.headers.authorization||'').replace(/^Bearer /,'');const user=verifyToken(token);if(!user||!['admin','editor'].includes(user.role))return res.status(401).json({success:false,message:'Admin/editor authentication required.'});req.user=user;res.setHeader('Cache-Control','no-store');res.setHeader('X-Robots-Tag','noindex, nofollow');next()}
const id=value=>{if(!mongoose.isValidObjectId(value))throw apiError('Article not found.',404);return value}
export function createBlogRouter(){
  const router=express.Router()
  router.use((req,res,next)=>{if(/^\/(?:blogs(?:\/|$)|blog-|admin\/blog)/.test(req.path)){res.setHeader('Cache-Control','no-store');res.setHeader('X-Robots-Tag','noindex, nofollow')}next()})
  router.get('/blog-page',endpoint(async(req,res)=>ok(res,await blogPageData(String(req.query.path||'/blogs')))))
  router.get('/blogs',endpoint(async(req,res)=>ok(res,await blogListing(req.query))))
  router.get('/blog-categories',endpoint(async(req,res)=>ok(res,await getBlogCategories())))
  router.get('/blog-settings',endpoint(async(req,res)=>ok(res,(await getBlogSettings()).config)))
  router.get('/blogs/:slug',endpoint(async(req,res)=>{const article=await findPublicArticle(req.params.slug);ok(res,{article,redirect:article.slug!==req.params.slug?'/blogs/'+article.slug:null,settings:(await getBlogSettings()).config,related:(await Blog.find({...publicBlogFilter(),_id:{$ne:article._id},$and:[{$or:[{categories:{$in:article.categories||[]}},{topicCluster:article.topicCluster||'__none__'}]}]}).select('title slug excerpt featuredImage publishedAt categories').limit(3).lean())})}))
  router.use('/admin',admin)
  router.post('/admin/blog-import',endpoint(async(req,res)=>ok(res,{html:sanitizeBlogImport(stringField(req.body.html,2000000))})))
  router.get('/admin/blogs',endpoint(async(req,res)=>ok(res,await blogListing(req.query,true))))
  router.post('/admin/blogs',endpoint(async(req,res)=>{const settings=(await getBlogSettings()).config;const payload={title:'',slug:'article-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),document:EMPTY_BLOG_DOC,...req.body,status:'draft'};const fields=validateBlogInput(payload,{},settings);const article=await Blog.create({...fields,searchText:blogText(fields.document),slugs:[fields.slug],lastEditedBy:req.user.username});ok(res,article,201)}))
  router.get('/admin/blogs/:id',endpoint(async(req,res)=>{const article=await Blog.findById(id(req.params.id)).lean();if(!article)throw apiError('Article not found.',404);ok(res,article)}))
  const save=async(req,res,transform)=>{
    const previous=await Blog.findById(id(req.params.id)).lean();if(!previous)throw apiError('Article not found.',404)
    if(!Number.isInteger(req.body.version)||previous.__v!==req.body.version)throw apiError('Another session saved this article. Your local edits are retained; reload the latest version or copy your content before merging.',409)
    const input=transform?await transform(previous):req.body,fields=validateBlogInput(input,previous,(await getBlogSettings()).config)
    if(fields.slug!==previous.slug&&previous.slugs?.includes(fields.slug))throw apiError('A previous slug is already a permanent redirect. Choose a fresh slug to avoid cached redirect loops.',409)
    const slugs=[...new Set([...(previous.slugs||[previous.slug]),fields.slug])]
    let article
    const session=await mongoose.startSession()
    try{await session.withTransaction(async()=>{
      article=await Blog.findOneAndUpdate({_id:previous._id,__v:req.body.version},{$set:{...fields,slugs,searchText:blogText(fields.document),lastEditedBy:req.user.username},$inc:{__v:1}},{returnDocument:'after',runValidators:true,session}).lean()
      if(!article)throw apiError('Concurrent update detected. Your local edits are retained.',409)
      await BlogRevision.create([{blog:previous._id,version:previous.__v,snapshot:previous,editor:req.user.username}],{session})
      await enqueueBlogChange(previous,article,session)
    })}finally{await session.endSession()}
    ok(res,article)
  }
  router.put('/admin/blogs/:id',endpoint((req,res)=>save(req,res)))
  router.post('/admin/blogs/:id/publish',endpoint((req,res)=>save(req,res,previous=>({...previous,...req.body,status:'published',publishedAt:previous.publishedAt&&new Date(previous.publishedAt)<=new Date()?previous.publishedAt:new Date()}))))
  router.post('/admin/blogs/:id/unpublish',endpoint((req,res)=>save(req,res,previous=>({...previous,status:'draft'}))))
  router.post('/admin/blogs/:id/duplicate',endpoint(async(req,res)=>{const article=await Blog.findById(id(req.params.id)).lean();if(!article)throw apiError('Article not found.',404);delete article._id;delete article.__v;delete article.createdAt;delete article.updatedAt;article.slug=article.slug+'-copy-'+Date.now().toString(36);article.slugs=[article.slug];article.title=article.title+' (Copy)';article.status='draft';article.publishedAt=null;article.scheduledAt=null;article.seo={...article.seo,canonical:''};article.faq={...article.faq,items:(article.faq?.items||[]).map((item,index)=>({...item,id:'faq-'+Date.now()+'-'+index}))};ok(res,await Blog.create(article),201)}))
  router.delete('/admin/blogs/:id',endpoint(async(req,res)=>{const session=await mongoose.startSession();try{await session.withTransaction(async()=>{const article=await Blog.findOneAndDelete({_id:id(req.params.id),__v:Number(req.query.version)},{session});if(!article)throw apiError('Article missing or changed; refresh before deleting.',409);await enqueueBlogChange(article,null,session);await BlogRevision.deleteMany({blog:article._id},{session})})}finally{await session.endSession()}ok(res,{deleted:true})}))
  router.get('/admin/blogs/:id/revisions',endpoint(async(req,res)=>ok(res,await BlogRevision.find({blog:id(req.params.id)}).select('version editor createdAt snapshot.title snapshot.status').sort({version:-1}).limit(100).lean())))
  router.post('/admin/blogs/:id/restore/:revision',endpoint((req,res)=>save(req,res,async previous=>{const revision=await BlogRevision.findOne({_id:id(req.params.revision),blog:previous._id}).lean();if(!revision)throw apiError('Revision not found.',404);return {...revision.snapshot,slug:previous.slug,seo:{...revision.snapshot.seo,canonical:revision.snapshot.slug===previous.slug?revision.snapshot.seo?.canonical:''},substantiveUpdatedAt:new Date(),status:previous.status,publishedAt:previous.publishedAt,scheduledAt:previous.scheduledAt}})))
  router.get('/admin/blog-settings',endpoint(async(req,res)=>ok(res,await getBlogSettings())))
  router.put('/admin/blog-settings',endpoint(async(req,res)=>{const current=await BlogSettings.findById('blog').lean();if((current?.version||0)!==req.body.version)throw apiError('Blog settings changed in another session.',409);const config=validateBlogSettings(req.body.config);let result;if(!current)result=await BlogSettings.create({_id:'blog',config,version:1});else result=await BlogSettings.findOneAndUpdate({_id:'blog',version:req.body.version},{$set:{config},$inc:{version:1}},{returnDocument:'after'});if(!result)throw apiError('Settings changed in another session.',409);ok(res,{config:result.config,version:result.version})}))
  router.get('/admin/blog-categories',endpoint(async(req,res)=>ok(res,await getBlogCategories(true))))
  router.put('/admin/blog-categories/:slug',endpoint(async(req,res)=>{const slug=slugField(req.params.slug),data=req.body;if(data.slug&&data.slug!==slug)throw apiError('Category slugs remain stable; create another category to change its URL.');ok(res,await BlogCategory.findOneAndUpdate({slug},{$set:{name:stringField(data.name,100)||slug,slug,description:stringField(data.description,2000),image:safeImage({src:data.image})?.src||'',seoTitle:stringField(data.seoTitle,240),metaDescription:stringField(data.metaDescription,1000),order:Math.min(1000,Math.max(0,Number(data.order)||0)),visible:data.visible!==false}},{upsert:true,returnDocument:'after',runValidators:true}))}))
  router.post('/admin/blog-indexnow',endpoint(async(req,res)=>ok(res,await flushBlogNotifications())))
  router.get('/admin/blog-insights',endpoint(async(req,res)=>{
    const articles=await Blog.find({}).select('title slug document seo excerpt author featuredImage updatedAt reviewAt topicCluster').limit(500).lean()
    const published=await Blog.find(publicBlogFilter()).select('title slug categories topicCluster').limit(500).lean()
    let searchConsole={connected:false,message:'Connect a verified Search Console property and a server-side access token to load real metrics.'}
    if(process.env.SEARCH_CONSOLE_ACCESS_TOKEN&&process.env.SEARCH_CONSOLE_SITE_URL){try{
      const day=offset=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(Date.now()-offset*86400000))
      const query=async(start,end,dimensions)=>{const response=await fetch('https://www.googleapis.com/webmasters/v3/sites/'+encodeURIComponent(process.env.SEARCH_CONSOLE_SITE_URL)+'/searchAnalytics/query',{method:'POST',headers:{Authorization:'Bearer '+process.env.SEARCH_CONSOLE_ACCESS_TOKEN,'Content-Type':'application/json'},body:JSON.stringify({startDate:day(start),endDate:day(end),dimensions,rowLimit:1000,dimensionFilterGroups:[{filters:[{dimension:'page',operator:'contains',expression:'/blogs/'}]}]}),signal:AbortSignal.timeout(10000)});if(!response.ok)throw new Error();return response.json()}
      const [pages,current,previous,timeline]=await Promise.all([query(30,3,['page','query']),query(30,3,[]),query(58,31,[]),query(30,3,['date'])])
      searchConsole={connected:true,data:pages,current:current.rows?.[0]||null,previous:previous.rows?.[0]||null,timeline:timeline.rows||[],range:{start:day(30),end:day(3)},message:'Real Search Console data for blog URLs; the latest three days are excluded for reporting delay. Comparison uses the preceding 28 days.'}
    }catch{searchConsole={connected:false,message:'Search Console access failed. Check the property, token expiry and permissions.'}}}

    ok(res,{articleCount:await Blog.countDocuments({}),articles:articles.map(article=>({id:article._id,title:article.title,slug:article.slug,checks:blogGuidance(article),updatedAt:article.updatedAt,reviewAt:article.reviewAt,topicCluster:article.topicCluster})),published,searchConsole,indexNow:{configured:indexNowConfigured(),message:indexNowConfigured()?'Durable notifications are queued for publication changes. Process the queue manually or configure the authenticated production worker.':'IndexNow is disconnected; no indexing metrics are fabricated.'}})
  }))
  return router
}
