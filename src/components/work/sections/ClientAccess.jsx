import { ButtonIcon } from '../../ui/DownloadButton'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import TypographyText from './TypographyText'
import { accessAppearance, accessButtons, accessDestination, accessElementId, accessLayout, clampAccess, downloadSameOrigin } from '../../../lib/clientAccess'
import { trackButtonClick } from '../../../lib/analytics'


export function AccessAction({ button, section, project, editor }) {
  const appearance = accessAppearance(button), destination = accessDestination(button.action)
  const disabled = !button.enabled || !destination.href
  const origin = typeof window === 'undefined' ? 'https://local.invalid' : window.location.origin
  const downloadable = destination.download && downloadSameOrigin(destination.href, origin)
  const tag = editor || disabled ? 'button' : button.action.type === 'internal' && !button.action.newTab ? Link : 'a'
  const attrs = tag === Link ? { to: destination.href } : tag === 'a' ? { href: destination.href, target: button.action.newTab && ['external','internal','download','whatsapp'].includes(button.action.type) ? '_blank' : undefined, rel: 'noopener noreferrer', download: downloadable ? button.action.filename || true : undefined } : { type:'button', disabled: !editor && disabled }
  const style = {
    display:'inline-flex', alignItems:'center', justifyContent: appearance.textAlign === 'left' ? 'flex-start' : appearance.textAlign === 'right' ? 'flex-end' : 'center', gap:8, width:'100%', minWidth:'min(100%, '+Math.min(clampAccess(appearance.minWidth,0,2000),clampAccess(appearance.maxWidth,1,2000,600))+'px)', maxWidth:'100%',
    minHeight:clampAccess(appearance.height,0,1600), padding:clampAccess(appearance.paddingY,0,200)+'px '+clampAccess(appearance.paddingX,0,200)+'px', borderStyle:'solid', borderWidth:clampAccess(appearance.borderWidth,0,20), borderRadius:clampAccess(appearance.radius,0,300), background:disabled ? appearance.disabledBackground : appearance.background, color:disabled ? appearance.disabledText : appearance.textColor, borderColor:disabled ? appearance.disabledBorder : appearance.borderColor, opacity:disabled ? clampAccess(appearance.disabledOpacity,0,1,.6) : 1,
    textAlign:appearance.textAlign, backdropFilter:button.preset==='glass'?'blur(12px)':undefined, '--access-hover-bg':appearance.hoverBackground, '--access-hover-text':appearance.hoverText, '--access-hover-border':appearance.hoverBorder
  }
  const icon = <ButtonIcon name={button.icon} size={clampAccess(appearance.iconSize,8,100,20)} />
  return <TypographyText as={tag} role="button" project={project} section={section} {...attrs} data-access-action={button.id} data-disabled={disabled} aria-label={button.accessibleLabel || (!String(button.label).trim() ? 'Client access '+button.action.type+' action' : undefined)} title={button.tooltip || undefined} className="client-access-action" style={style}
    onClick={event=>{ if(editor) { event.preventDefault(); editor.onSelect(button.id) } else if(disabled) event.preventDefault(); else trackButtonClick(button.label,'client_access',{action:button.action.type}) }}>
    {button.iconPlacement!=='right' && icon}
    <span className="min-w-0"><TypographyText role="button" elementId={accessElementId(button.id)} project={project} section={section} className="client-access-label block">{button.label}</TypographyText>
      {button.secondaryText && <TypographyText role="caption" elementId={accessElementId(button.id)+'-secondary'} project={project} section={section} className="client-access-label block text-xs opacity-80">{button.secondaryText}</TypographyText>}
    </span>{button.iconPlacement==='right' && icon}
  </TypographyText>
}

export default function ClientAccess({ section, project, editor }) {
  const buttons=accessButtons(section,project), layout=accessLayout(section)
  const [viewport,setViewport]=useState(()=>typeof window==='undefined'?1280:window.innerWidth)
  const [dragged,setDragged]=useState(null), [over,setOver]=useState(null), [placement,setPlacement]=useState(null), [largest,setLargest]=useState(0)
  const canvas=useRef(null), pointer=useRef(null)
  const device=viewport<768?'Mobile':viewport<1024?'Tablet':'Desktop'
  const value=key=>layout[key+device] ?? layout[key]
  const requested=device==='Desktop'?layout.mode:layout['mode'+device] || layout.mode
  const mode=requested==='custom' && viewport<768 ? 'stack' : requested
  const custom=mode==='custom'
  useEffect(()=>{const resize=()=>setViewport(window.innerWidth);window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize)},[])
  useEffect(()=>{
    if(!canvas.current) return
    const measure=()=>setLargest(Math.max(0,...[...canvas.current.querySelectorAll('[data-access-item]')].map(node=>node.offsetHeight)))
    const observer=new ResizeObserver(measure);canvas.current.querySelectorAll('[data-access-item]').forEach(node=>observer.observe(node));measure()
    return()=>observer.disconnect()
  },[buttons.length,custom])
  if(!buttons.length && !editor) return null
  const move=(id,target)=>{ const next=[...buttons], index=next.findIndex(item=>item.id===id); if(index<0 || target<0 || target>=next.length || index===target)return;next.splice(target,0,...next.splice(index,1));editor?.onReorder(next.map(item=>item.id)) }
  const align={left:'flex-start',center:'center',right:'flex-end'}[value('align')] || 'center'
  const container={position:'relative',display:custom?'block':mode==='grid'?'grid':'flex',flexDirection:mode==='stack'?'column':'row',flexWrap:value('wrap')===false?'nowrap':'wrap',gap:clampAccess(value('gap'),0,200,16),alignItems:mode==='stack'?align:({top:'flex-start',center:'center',bottom:'flex-end'}[value('verticalAlign')] || 'center'),justifyContent:mode==='stack'?({top:'flex-start',center:'center',bottom:'flex-end'}[value('verticalAlign')] || 'center'):align,gridTemplateColumns:mode==='grid'?'repeat('+Math.floor(clampAccess(layout['columns'+device],1,12,1))+', minmax(0,1fr))':undefined,minHeight:custom?Math.max(clampAccess(value('canvasHeight'),160,2000,360),Math.ceil(buttons.length/2)*(largest+24)):clampAccess(value('minHeight'),0,2000,0),width:'100%',maxWidth:'100%'}
  return <section className="mx-auto my-20 max-w-5xl px-4" data-client-access={section.id}>
    <style>{'.client-access-action{overflow-wrap:anywhere;cursor:pointer;transition:background-color .15s,color .15s,border-color .15s;outline-offset:3px;box-sizing:border-box}[data-access-item]:focus-within{z-index:20}.client-access-action:focus-visible{outline:3px solid #fbbf24}.client-access-action[data-disabled="false"]:hover{background:var(--access-hover-bg)!important;border-color:var(--access-hover-border)!important;color:var(--access-hover-text)!important}.client-access-action[data-disabled="false"]:hover .client-access-label{color:var(--access-hover-text)!important}.client-access-action[data-disabled="true"]{cursor:default}.client-access-action[data-disabled="true"] .client-access-label{color:inherit!important}@media(prefers-reduced-motion:reduce){.client-access-action{transition:none}}'}</style>
    <div className="rounded-2xl border border-borderSubtle bg-gradient-to-br from-surface to-secondary shadow-xl" style={{padding:clampAccess(value('paddingY'),0,200,32)+'px '+clampAccess(value('paddingX'),0,200,32)+'px'}}>
      <TypographyText project={project} section={section} role="sectionHeading" as="h3" className="mb-4 text-center font-heading text-2xl font-bold text-textPrimary md:text-3xl">{section.title || 'Client Access'}</TypographyText>
      <TypographyText project={project} section={section} role="body" as="p" className="mx-auto mb-6 max-w-2xl text-center text-sm text-textSecondary md:text-base">{section.content?.description ?? 'Access photos, videos, albums and other event files using the links below.'}</TypographyText>
      <div ref={canvas} data-access-canvas data-access-mode={mode} style={container}>
        {buttons.map((button,index)=>{
          const appearance=accessAppearance(button), position=placement?.id===button.id?placement:button.position
          const x=clampAccess(position.x,0,100,50), y=clampAccess(position.y,0,100,50)
          const full=value('fullWidth')===true
          return <div key={button.id} data-access-item={button.id} draggable={!!editor && !custom}
            className="min-w-0" style={{width:full?'100%':custom?'max-content':'fit-content',maxWidth:full?'100%':'min(100%, '+clampAccess(appearance.maxWidth,1,2000,600)+'px)',minWidth:'min(100%, '+Math.min(clampAccess(appearance.minWidth,0,2000),clampAccess(appearance.maxWidth,1,2000,600))+'px)',justifySelf:mode==='grid'?align:undefined,flexShrink:1,position:custom?'absolute':'relative',left:custom?x+'%':undefined,top:custom?y+'%':undefined,transform:custom?'translate(-'+x+'%, -'+y+'%)':undefined,outline:editor && (editor.selectedId===button.id || over===button.id)?'2px solid #fbbf24':undefined,outlineOffset:3,opacity:dragged===button.id?.5:1,touchAction:editor&&custom?'none':undefined}}
            onDragStart={event=>{if(!editor)return;event.stopPropagation();setDragged(button.id);event.dataTransfer.setData('text/plain',button.id);event.dataTransfer.effectAllowed='move'}}
            onDragOver={event=>{if(!editor||!dragged)return;event.preventDefault();event.stopPropagation();setOver(button.id)}}
            onDrop={event=>{if(!editor)return;event.preventDefault();event.stopPropagation();move(dragged,index);setDragged(null);setOver(null)}}
            onDragEnd={()=>{setDragged(null);setOver(null)}}
            onPointerDown={event=>{if(!editor||!custom||event.button!==0)return;event.preventDefault();editor.onSelect(button.id);pointer.current={id:button.id,startX:event.clientX,startY:event.clientY,x,y};setPlacement({id:button.id,x,y});event.currentTarget.setPointerCapture(event.pointerId)}}
            onPointerMove={event=>{const active=pointer.current;if(!active||active.id!==button.id)return;const w=Math.max(1,canvas.current.clientWidth-event.currentTarget.offsetWidth),h=Math.max(1,canvas.current.clientHeight-event.currentTarget.offsetHeight);const next={id:button.id,x:clampAccess(active.x+(event.clientX-active.startX)*100/w,0,100),y:clampAccess(active.y+(event.clientY-active.startY)*100/h,0,100)};pointer.current.next=next;setPlacement(next)}}
            onPointerUp={()=>{const active=pointer.current;if(!active)return;const next=active.next||active;pointer.current=null;setPlacement(null);editor?.onPlace(button.id,{x:next.x,y:next.y})}}
            onPointerCancel={()=>{pointer.current=null;setPlacement(null)}}
            onKeyDown={event=>{if(!editor||!custom||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();const step=event.shiftKey?10:2;editor.onPlace(button.id,{x:clampAccess(x+(event.key==='ArrowRight'?step:event.key==='ArrowLeft'?-step:0),0,100),y:clampAccess(y+(event.key==='ArrowDown'?step:event.key==='ArrowUp'?-step:0),0,100)})}}>
            <AccessAction button={button} section={section} project={project} editor={editor} />
            {editor && !custom && <div className="mt-1 flex gap-2 text-xs text-amber-300"><button type="button" disabled={index===0} aria-label={'Move button '+(index+1)+' earlier'} onClick={()=>move(button.id,index-1)}>Earlier</button><button type="button" disabled={index===buttons.length-1} aria-label={'Move button '+(index+1)+' later'} onClick={()=>move(button.id,index+1)}>Later</button></div>}
            {editor && over===button.id && dragged!==button.id && <span className="pointer-events-none absolute inset-x-0 top-0 bg-amber-400 p-1 text-center text-xs text-black">Drop at position {index+1}</span>}
          </div>
        })}
        {!buttons.length && <p className="text-sm text-textSecondary">Add a button to begin.</p>}
      </div>
    </div>
  </section>
}
