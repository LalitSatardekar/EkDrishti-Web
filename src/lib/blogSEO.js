import { blogText, escapeHTML, safeBlogURL } from './blogContent.js'
const configuredOrigin = (typeof process !== 'undefined' ? process.env.BLOG_PUBLIC_ORIGIN : '') || import.meta.env?.VITE_BLOG_PUBLIC_ORIGIN
export const BLOG_ORIGIN = ['https://www.ekdrishti.com','https://ekdrishti.com'].includes(configuredOrigin) ? configuredOrigin : 'https://www.ekdrishti.com'
export const jsonScript = data => JSON.stringify(data).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026')
export function blogSEO(article, settings = {}) {
  const canonical = article.seo?.canonical || `${BLOG_ORIGIN}/blogs/${article.slug}`
  const title=article.seo?.title||article.title, description=article.seo?.description||article.excerpt||blogText(article.document).slice(0,160)
  const image=safeBlogURL(article.seo?.image||article.featuredImage?.src||settings.socialImage,{image:true})
  const absoluteImage=image ? new URL(image,BLOG_ORIGIN).href : ''
  const author=article.author?.name ? { '@type':'Person',name:article.author.name,...(article.author.bio ? {description:article.author.bio}:{}),...(article.author.slug&&article.author.bio ? {url:`${BLOG_ORIGIN}/blogs/author/${article.author.slug}`}:{}) } : undefined
  const schema=[{'@context':'https://schema.org','@type':'BlogPosting',headline:article.title,description,url:canonical,mainEntityOfPage:canonical,...(author?{author}:{}),publisher:{'@type':'Organization',name:settings.publisherName||'Ekdrishti Studios',url:BLOG_ORIGIN},...(article.publishedAt?{datePublished:new Date(article.publishedAt).toISOString()}:{}),...(article.substantiveUpdatedAt||article.updatedAt?{dateModified:new Date(article.substantiveUpdatedAt||article.updatedAt).toISOString()}:{}),...(absoluteImage?{image:[absoluteImage]}:{})},{'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{ '@type':'ListItem',position:1,name:'Home',item:BLOG_ORIGIN+'/'},{'@type':'ListItem',position:2,name:'Blogs',item:BLOG_ORIGIN+'/blogs'},{'@type':'ListItem',position:3,name:article.title,item:canonical}]}]
  return {title,description,canonical,image:absoluteImage,ogTitle:article.seo?.ogTitle||title,ogDescription:article.seo?.ogDescription||description,robots:article.seo?.noindex?'noindex, follow':'index, follow',schema}
}
export function blogHead(meta) {
  const tags=[['description',meta.description],['robots',meta.robots],['og:type',meta.article?'article':'website'],['og:title',meta.ogTitle||meta.title],['og:description',meta.ogDescription||meta.description],['og:url',meta.canonical],['twitter:card',meta.image?'summary_large_image':'summary'],['twitter:title',meta.ogTitle||meta.title],['twitter:description',meta.ogDescription||meta.description]]
  if(meta.image)tags.push(['og:image',meta.image],['twitter:image',meta.image])
  return `<title data-rh="true">${escapeHTML(meta.title)}</title><link data-rh="true" rel="canonical" href="${escapeHTML(meta.canonical)}">`+tags.map(([name,value])=>`<meta data-rh="true" ${name.startsWith('og:')?'property':'name'}="${name}" content="${escapeHTML(value)}">`).join('')+(meta.schema||[]).map(schema=>`<script data-rh="true" type="application/ld+json">${jsonScript(schema)}</script>`).join('')
}
