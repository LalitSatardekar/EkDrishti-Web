import Blog from '../models/Blog.js'
import BlogSettings from '../models/BlogSettings.js'
import BlogCategory from '../models/BlogCategory.js'
import { DEFAULT_BLOG_SETTINGS, DEFAULT_BLOG_CATEGORIES, publicBlogFilter, isBlogPublic, apiError } from './blogValidation.js'
export async function getBlogSettings(){const doc=await BlogSettings.findById('blog').lean();return {config:{...DEFAULT_BLOG_SETTINGS,...doc?.config},version:doc?.version||0}}
export async function getBlogCategories(admin=false){const records=await BlogCategory.find({}).lean();const map=new Map(DEFAULT_BLOG_CATEGORIES.map(category=>[category.slug,category]));records.forEach(category=>map.set(category.slug,category));const list=[...map.values()].sort((a,b)=>(a.order||0)-(b.order||0));if(admin)return list;const used=await Blog.distinct('categories',publicBlogFilter());return list.filter(category=>category.visible!==false&&used.includes(category.slug))}
export function publicArticle(article){return {...article,status:'published',publishedAt:article.status==='scheduled'?article.scheduledAt:article.publishedAt,slugs:undefined,lastEditedBy:undefined,__v:undefined}}
export function pageArgs(query={},fallback=9){const number=(value,def)=>Number.isFinite(Number(value))?Math.floor(Number(value)):def;return {page:Math.max(1,number(query.page,1)),limit:Math.min(50,Math.max(1,number(query.limit,fallback)))}}
export async function blogListing(query={},admin=false){
  const {config}=await getBlogSettings(),{page,limit}=pageArgs(query,config.perPage),filter=admin?{}:publicBlogFilter()
  if(query.category)filter.categories=String(query.category)
  if(query.author)filter['author.slug']=String(query.author)
  if(admin&&query.status){if(query.status==='published')filter.$or=publicBlogFilter().$or;else{filter.status=String(query.status);if(query.status==='scheduled')filter.scheduledAt={$gt:new Date()}}}
  if(query.featured==='true')filter.featured=true
  if(query.q){const search=String(query.q).slice(0,150).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');filter.$and=[{$or:[{title:{$regex:search,$options:'i'}},{excerpt:{$regex:search,$options:'i'}},{searchText:{$regex:search,$options:'i'}}]}]}
  const sort=({oldest:{publishedAt:1,_id:1},title:{title:1,_id:1},status:{status:1,updatedAt:-1},updated:{updatedAt:-1}})[query.sort||config.sort]||{publishedAt:-1,createdAt:-1}
  const [total,records]=await Promise.all([Blog.countDocuments(filter),Blog.find(filter).select('-document -faq -sources -experience -searchText').sort(sort).skip((page-1)*limit).limit(limit).lean()])
  return {items:admin?records.map(article=>({...article,effectiveStatus:isBlogPublic(article)?'published':article.status})):records.map(publicArticle),total,page,pages:Math.max(1,Math.ceil(total/limit)),limit}
}
export async function findPublicArticle(slug){const article=await Blog.findOne({slugs:slug,...publicBlogFilter()}).lean();if(!article)throw apiError('Article not found.',404);return publicArticle(article)}
