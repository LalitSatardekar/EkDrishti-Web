import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { blogRequest } from '../api/blogApi'
import { blogArticleHTML, blogListingHTML } from '../lib/blogPresentation'
import { jsonScript } from '../lib/blogSEO'
import { trackButtonClick } from '../lib/analytics'
import '../components/blog/blog.css'

function bootstrap(path){try{const data=JSON.parse(document.getElementById('blog-bootstrap')?.textContent||'null');return data?.path===path?data:null}catch{return null}}
export function BlogMetadata({meta,preview=false}){
  if(!meta)return null
  return <Helmet><title>{meta.title}</title><meta name="description" content={meta.description||''}/><meta name="robots" content={preview?'noindex, nofollow':meta.robots||'index, follow'}/><link rel="canonical" href={meta.canonical}/><meta property="og:type" content={meta.article?'article':'website'}/><meta property="og:title" content={meta.ogTitle||meta.title}/><meta property="og:description" content={meta.ogDescription||meta.description||''}/><meta property="og:url" content={meta.canonical}/><meta property="og:image" content={meta.image||''}/><meta name="twitter:card" content={meta.image?'summary_large_image':'summary'}/><meta name="twitter:title" content={meta.ogTitle||meta.title}/><meta name="twitter:description" content={meta.ogDescription||meta.description||''}/><meta name="twitter:image" content={meta.image||''}/>{!preview&&(meta.schema||[]).map((schema,index)=><script key={index} type="application/ld+json">{jsonScript(schema)}</script>)}</Helmet>
}
export default function Blogs(){
  const location=useLocation(),navigate=useNavigate(),[data,setData]=useState(()=>bootstrap(location.pathname)),[error,setError]=useState('')
  useEffect(()=>{document.head.querySelectorAll('meta:not([data-rh])').forEach(node=>{const key=node.getAttribute('name')||node.getAttribute('property')||'';if(['title','description','robots','author'].includes(key)||/^(og:|twitter:)/.test(key))node.remove()})},[])
  useEffect(()=>{const controller=new AbortController();setError('');blogRequest('blog-page?path='+encodeURIComponent(location.pathname+location.search),{signal:controller.signal}).then(value=>{if(value.redirect)navigate(value.redirect,{replace:true});else setData(value)}).catch(error=>{if(error.name!=='AbortError'){setData(null);setError(error.status===404?'This article or page is not available.':'The journal is temporarily unavailable. Please try again.')}});return()=>controller.abort()},[location.pathname,location.search,navigate])
  useEffect(()=>{if(data?.kind==='article')trackButtonClick(data.article.title,'blog_view',{slug:data.article.slug})},[data?.article?.slug])
  if(error)return <div className="blog-error"><Helmet><title>Journal — Ekdrishti Studios</title><meta name="robots" content="noindex, nofollow"/></Helmet><h1>{error}</h1><a href="/blogs" className="text-amber-400">Return to the journal</a></div>
  if(!data)return <div role="status" className="blog-error">Loading the journal…</div>
  return <><BlogMetadata meta={data.meta}/><div data-blog-page onClick={event=>{const link=event.target.closest('a');if(!link)return;const href=link.getAttribute('href');if(link.dataset.blogTrack)trackButtonClick(link.textContent,'blog_'+link.dataset.blogTrack,{slug:data.article?.slug});if(href?.startsWith('/')&&!link.target&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey&&event.button===0){event.preventDefault();navigate(href)}}} onSubmit={event=>{if(event.target.matches('.blog-search')){event.preventDefault();navigate(event.target.getAttribute('action')+'?'+new URLSearchParams(new FormData(event.target)))}}} dangerouslySetInnerHTML={{__html:data.kind==='article'?blogArticleHTML(data.article,data.settings,data.related):blogListingHTML(data)}}/></>
}
