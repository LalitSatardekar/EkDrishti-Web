import { uploadMediaFile } from './mediaApi'
export function blogMediaHistory(){try{const value=JSON.parse(localStorage.getItem('ekdrishti_uploaded_media')||'[]');return Array.isArray(value)?value:[]}catch{return []}}
export async function uploadBlogImage(file,token){const media=await uploadMediaFile(file,token);try{localStorage.setItem('ekdrishti_uploaded_media',JSON.stringify([{url:media.src,name:file.name,date:new Date().toISOString()},...blogMediaHistory().filter(item=>item.url!==media.src)].slice(0,300)))}catch{}return media}
export async function blogRequest(path, { token, method = 'GET', body, signal } = {}) {
  const response=await fetch('/v1/'+path,{method,signal,headers:{Accept:'application/json',...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})})
  const result=await response.json().catch(()=>({message:'The blog service returned an unexpected response.'}))
  if(!response.ok||!result.success){const error=new Error(result.message||'Unable to complete this request.');error.status=response.status;throw error}
  return result.data
}
