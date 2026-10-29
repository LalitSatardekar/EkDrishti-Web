import app from '../server.js'
export default function handler(req,res){
  const url=new URL(req.url,'http://runtime.local')
  const route=url.searchParams.get('__app_path')
  if(route&&route.startsWith('/')&&!route.startsWith('//')){
    url.searchParams.delete('__app_path')
    req.url=route+(url.searchParams.size?'?'+url.searchParams.toString():'')
    req.originalUrl=req.url
  }
  return app(req,res)
}
