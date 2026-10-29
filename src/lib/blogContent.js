// Canonical, bounded ProseMirror JSON shared by the editor, API and HTTP renderer.
export const EMPTY_BLOG_DOC = { type: 'doc', content: [{ type: 'paragraph' }] }
export const BLOG_FONTS = ['Inter', 'Plus Jakarta Sans', 'Georgia', 'Arial', 'system-ui', 'Playfair Display', 'Great Vibes']
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
export function safeBlogURL(value, { image = false } = {}) {
  const text = String(value || '').trim()
  if (!text || /[\u0000-\u0020\u007f\\<>"'`]/.test(text)) return ''
  if (/^\/(?!\/)/.test(text) || (!image && /^#[\w-]+$/.test(text))) return text
  try { const u = new URL(text); return ['http:', 'https:'].includes(u.protocol) && !u.username && !u.password ? u.href : '' } catch { return '' }
}
const color = value => /^(#[\da-f]{3,8}|transparent|currentColor)$/i.test(String(value))
export function blogStyles(attrs = {}) {
  const result = {}, enums = { textAlign: ['left','center','right','justify'], textTransform: ['none','uppercase','lowercase','capitalize'], fontStyle: ['normal','italic'], textDecoration: ['none','underline','line-through'] }
  for (const key of ['color','backgroundColor','WebkitTextStrokeColor']) if (color(attrs[key])) result[key] = attrs[key]
  for (const [key, values] of Object.entries(enums)) if (values.includes(attrs[key])) result[key] = attrs[key]
  if (/^[\w ,'-]{1,100}$/.test(attrs.fontFamily || '')) result.fontFamily = attrs.fontFamily
  if (/^[1-9]00$/.test(String(attrs.fontWeight))) result.fontWeight = String(attrs.fontWeight)
  for (const [key,min,max] of [['fontSize',8,120],['lineHeight',.7,3],['letterSpacing',-3,12],['WebkitTextStrokeWidth',0,3]]) {
    if (attrs[key] === '' || attrs[key] == null) continue
    const raw = String(attrs[key]).replace(/px$/, ''), n = Number(raw)
    if (Number.isFinite(n) && n >= min && n <= max) result[key] = n + (key === 'lineHeight' ? '' : 'px')
  }
  if (/^-?\d{1,2}px -?\d{1,2}px \d{1,2}px #[\da-f]{3,8}$/i.test(attrs.textShadow || '')) result.textShadow = attrs.textShadow
  return result
}
export const styleHTML = attrs => Object.entries(blogStyles(attrs)).map(([key,value]) => `${key.replace(/[A-Z]/g, letter => '-'+letter.toLowerCase())}:${value}`).join(';')
const nodes = new Set(['doc','paragraph','text','heading','blockquote','codeBlock','horizontalRule','hardBreak','bulletList','orderedList','listItem','taskList','taskItem','table','tableRow','tableCell','tableHeader','image','callout'])
const marks = new Set(['bold','italic','underline','strike','code','highlight','superscript','subscript','link','textStyle'])
export function validateBlogDocument(doc, { maxNodes = 15000 } = {}) {
  if (!doc || doc.type !== 'doc' || JSON.stringify(doc).length > 2000000) throw new Error('Article must be a structured document under 2 MB.')
  let count = 0
  const visit = (node, depth = 0) => {
    if (!node || !nodes.has(node.type) || depth > 32 || ++count > maxNodes) throw new Error('Unsupported or excessively nested article content.')
    if (node.type === 'text' && (typeof node.text !== 'string' || node.text.length > 200000)) throw new Error('Invalid article text.')
    if (node.type === 'heading' && ![1,2,3,4,5,6].includes(node.attrs?.level)) throw new Error('Heading level must be H1–H6.')
    if (node.type === 'image' && !safeBlogURL(node.attrs?.src, { image:true })) throw new Error('Use an uploaded image or a complete HTTP image URL; embedded image data is not allowed.')
    if (node.marks && !Array.isArray(node.marks)) throw new Error('Invalid formatting marks.')
    for (const mark of node.marks || []) {
      if (!marks.has(mark.type)) throw new Error('Unsupported article formatting.')
      if (mark.type === 'link' && !safeBlogURL(mark.attrs?.href)) throw new Error('Unsafe or invalid article link.')
    }
    if (node.content && !Array.isArray(node.content)) throw new Error('Invalid document children.')
    const block = ['paragraph','heading','blockquote','codeBlock','horizontalRule','bulletList','orderedList','taskList','table','image','callout']
    const grammar = {doc:block,paragraph:['text','hardBreak'],heading:['text','hardBreak'],blockquote:block,callout:block,codeBlock:['text'],bulletList:['listItem'],orderedList:['listItem'],listItem:block,taskList:['taskItem'],taskItem:block,table:['tableRow'],tableRow:['tableCell','tableHeader'],tableCell:block,tableHeader:block,text:[],image:[],hardBreak:[],horizontalRule:[]}
    if ((node.content || []).some(child => !grammar[node.type].includes(child?.type))) throw new Error('Invalid structured document nesting.')
    if (node.type === 'doc' && !node.content?.length) throw new Error('Use an empty paragraph for a blank draft.')
    for (const child of node.content || []) visit(child, depth+1)
  }
  visit(doc)
  return doc
}
export function blogText(doc) { return (doc?.type === 'text' ? doc.text || '' : (doc?.content || []).map(blogText).join(['doc','bulletList','orderedList','taskList','listItem','tableRow','table'].includes(doc?.type) ? ' ' : '')).trim() }
export function blogWordCount(doc) { return blogText(doc).split(/\s+/).filter(Boolean).length }
export function renderBlogDocument(doc) {
  let headingIndex = 0
  const render = node => {
    const attrs = node.attrs || {}, children = () => (node.content || []).map(render).join(''), style = styleHTML(attrs)
    if (node.type === 'text') {
      let text = escapeHTML(node.text)
      for (const mark of node.marks || []) {
        const a = mark.attrs || {}, tag = { bold:'strong',italic:'em',underline:'u',strike:'s',code:'code',superscript:'sup',subscript:'sub' }[mark.type]
        if (tag) text = `<${tag}>${text}</${tag}>`
        if (mark.type === 'textStyle') text = `<span style="${escapeHTML(styleHTML(a))}">${text}</span>`
        if (mark.type === 'highlight') text = `<mark${color(a.color) ? ` style="background-color:${escapeHTML(a.color)}"` : ''}>${text}</mark>`
        if (mark.type === 'link' && safeBlogURL(a.href)) text = `<a href="${escapeHTML(safeBlogURL(a.href))}"${a.target === '_blank' ? ' target="_blank" rel="noopener noreferrer"' : ''}>${text}</a>`
      }
      return text
    }
    if (node.type === 'doc') return children()
    if (node.type === 'heading') { const level = Math.min(6,Math.max(1,Number(attrs.level)||2)); return `<h${level} id="heading-${++headingIndex}" style="${escapeHTML(style)}">${children()}</h${level}>` }
    if (node.type === 'hardBreak') return '<br>'
    if (node.type === 'horizontalRule') return '<hr>'
    if (node.type === 'image') {
      const src = safeBlogURL(attrs.src,{image:true}); if (!src) return ''
      const width = Math.max(10,Math.min(100,Number(attrs.displayWidth)||100)), align = ['left','center','right'].includes(attrs.align) ? attrs.align : 'center'
      const image = `<img src="${escapeHTML(src)}" alt="${escapeHTML(attrs.alt)}" loading="lazy" decoding="async"${Number(attrs.width)>0 ? ` width="${Math.min(12000,Number(attrs.width))}"` : ''}${Number(attrs.height)>0 ? ` height="${Math.min(12000,Number(attrs.height))}"` : ''}>`
      return `<figure style="width:${width}%;margin-left:${align==='left'?'0':'auto'};margin-right:${align==='right'?'0':'auto'}">${safeBlogURL(attrs.href) ? `<a href="${escapeHTML(safeBlogURL(attrs.href))}">${image}</a>` : image}${attrs.caption ? `<figcaption>${escapeHTML(attrs.caption)}</figcaption>` : ''}</figure>`
    }
    if (node.type === 'codeBlock') return `<pre><code>${children()}</code></pre>`
    if (node.type === 'table') return `<div class="blog-table"><table><tbody>${children()}</tbody></table></div>`
    if (['tableCell','tableHeader'].includes(node.type)) { const tag = node.type === 'tableHeader' ? 'th' : 'td'; return `<${tag} colspan="${Math.max(1,Math.min(12,Number(attrs.colspan)||1))}" rowspan="${Math.max(1,Math.min(100,Number(attrs.rowspan)||1))}" style="${escapeHTML(style)}">${children()}</${tag}>` }
    if (node.type === 'taskItem') return `<li data-checked="${attrs.checked===true}"><span aria-label="${attrs.checked ? 'Completed' : 'Not completed'}">${attrs.checked ? '☑' : '☐'}</span> ${children()}</li>`
    const tag = {paragraph:'p',blockquote:'blockquote',bulletList:'ul',orderedList:'ol',listItem:'li',taskList:'ul',tableRow:'tr',callout:'aside'}[node.type]
    return tag ? `<${tag}${node.type==='callout'?' class="blog-callout"':''} style="${escapeHTML(style)}">${children()}</${tag}>` : ''
  }
  return render(doc || EMPTY_BLOG_DOC)
}
export function blogTOC(doc) {
  const result=[];let n=0
  const walk = node => { if(node.type==='heading') result.push({id:'heading-'+(++n),level:node.attrs?.level||2,text:blogText(node)});(node.content||[]).forEach(walk) }
  walk(doc||EMPTY_BLOG_DOC);return result
}
export function blogGuidance(article) {
  const checks=[], toc=blogTOC(article.document), text=blogText(article.document)
  const warn=(test,message)=>{if(test)checks.push(message)}
  warn(!article.seo?.title,'Add a distinct SEO title, or review the article-title fallback.');warn(!article.seo?.description&&!article.excerpt,'Add an informative excerpt or meta description.');warn(!text,'Write the article body before publishing.');warn(!article.author?.name,'Add credible author information.');warn(toc.some(h=>h.level===1),'The article title is already H1; prefer H2–H6 in the body.');warn(toc.some((h,i)=>i&&h.level>toc[i-1].level+1),'Review skipped heading levels.');warn((article.seo?.title||article.title||'').length>65,'The title may be truncated in search; search engines choose the final presentation.')
  const walk=node=>{if(node.type==='image'&&!node.attrs?.alt)checks.push('Add alternative text to an inline image.');(node.content||[]).forEach(walk)};walk(article.document||EMPTY_BLOG_DOC)
  warn(article.featuredImage?.src&&!article.featuredImage.alt,'Add alternative text to the featured image.');warn(!JSON.stringify(article.document||{}).includes('"type":"link"'),'Consider useful internal links and sources where they help readers.');return [...new Set(checks)]
}
