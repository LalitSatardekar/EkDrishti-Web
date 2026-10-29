import BlogNotification from '../models/BlogNotification.js'
import Blog from '../models/Blog.js'
import { BLOG_ORIGIN } from '../../src/lib/blogSEO.js'
import { isBlogPublic } from './blogValidation.js'
export function indexNowConfigured(){return /^[a-zA-Z0-9-]{8,128}$/.test(process.env.INDEXNOW_KEY||'')}
export async function enqueueBlogChange(previous,current,session){
  const emit=isBlogPublic(previous||{})||isBlogPublic(current||{})||current?.status==='scheduled'
  await BlogNotification.updateMany({blog:(current||previous)._id,state:'pending',...(!emit?{intent:{$ne:'remove'}}:{})},{$set:{state:'cancelled'}},{session})
  if(!emit)return
  const urls=[...new Set([...(previous?.slugs||[]),...(current?.slugs||[])])].map(slug=>BLOG_ORIGIN+'/blogs/'+slug)
  const key=String((current||previous)._id)+':'+(current?.__v??'deleted')
  if(isBlogPublic(previous||{})&&current?.status==='scheduled'&&!isBlogPublic(current))await BlogNotification.updateOne({key:key+':remove'},{$setOnInsert:{key:key+':remove',blog:current._id,urls:[BLOG_ORIGIN+'/blogs/'+previous.slug],intent:'remove',dueAt:new Date(),state:'pending'}},{upsert:true,session})
  await BlogNotification.updateOne({key},{$setOnInsert:{key,blog:(current||previous)._id,urls,intent:current?.status==='scheduled'?'schedule':isBlogPublic(current||{})?'refresh':'remove',dueAt:current?.status==='scheduled'&&new Date(current.scheduledAt)>new Date()?current.scheduledAt:new Date(),state:'pending'}},{upsert:true,session})
}
export async function flushBlogNotifications(){
  if(!indexNowConfigured())return {connected:false,sent:0,message:'IndexNow is disconnected. Configure INDEXNOW_KEY and serve its verification file on the canonical production host.'}
  const events=await BlogNotification.find({state:'pending',dueAt:{$lte:new Date()}}).sort({dueAt:1}).limit(3).lean();let sent=0
  for(const event of events){
    const article=await Blog.findById(event.blog).select('status publishedAt scheduledAt').lean()
    // An unpublish/delete notification is useful too. Future schedules stay queued.
    if(event.intent!=='remove'&&article?.status==='scheduled'&&!isBlogPublic(article)){await BlogNotification.updateOne({_id:event._id},{$set:{dueAt:article.scheduledAt}});continue}
    if(event.intent!=='remove'&&(!article||!isBlogPublic(article))){await BlogNotification.updateOne({_id:event._id},{$set:{state:'cancelled'}});continue}
    try{const response=await fetch('https://api.indexnow.org/indexnow',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({host:new URL(BLOG_ORIGIN).host,key:process.env.INDEXNOW_KEY,keyLocation:BLOG_ORIGIN+'/indexnow-key.txt',urlList:event.urls}),signal:AbortSignal.timeout(10000)});await BlogNotification.updateOne({_id:event._id},{$set:{state:response.ok?'sent':'pending',lastStatus:response.status,dueAt:new Date(Date.now()+3600000)},$inc:{attempts:1}});if(response.ok)sent++}catch{await BlogNotification.updateOne({_id:event._id},{$set:{dueAt:new Date(Date.now()+3600000)},$inc:{attempts:1}})}
  }
  return {connected:true,sent,considered:events.length,message:'A successful notification means receipt, not confirmed indexing.'}
}
