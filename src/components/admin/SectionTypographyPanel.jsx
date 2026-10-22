import SectionTypographyControl from './SectionTypographyControl'
import TypographyStyleEditor from './TypographyStyleEditor'
import { patchTypography, resetTypography, typographyElements, TYPOGRAPHY_ROLES } from '../../lib/caseTypography'

export function projectFonts(project) {
  const fonts = new Map()
  const inspect = value => { if (!value || typeof value !== 'object') return; if (value.fontFamily) fonts.set(`${value.fontFamily}:${value.fontUrl || ''}`, value); Object.values(value).forEach(item => { if (item && typeof item === 'object') inspect(item) }) }
  inspect(project.typography); (project.sections || []).forEach(section => inspect(section.settings))
  return [...fonts.values()]
}
export default function SectionTypographyPanel({ section, project, onUpdate, onUploadFont }) {
  const elements = typographyElements(section, project)
  const fonts = projectFonts(project)
  if (!elements.length) return null
  return <details open className="rounded-xl border border-white/10 p-3" data-typography-section={section.id}><summary className="cursor-pointer text-sm font-semibold text-white">Typography — {section.type}</summary>
    <p className="my-2 text-[10px] text-textSecondary">Project defaults → section style → text element. Empty properties inherit. Changes remain unsaved until you save the case.</p>
    <details><summary className="cursor-pointer text-xs text-textSecondary">Base style for this section</summary><TypographyStyleEditor style={section.settings?.typography || {}} sample="Section typography preview" availableFonts={fonts} onUploadFont={onUploadFont} onChange={changes => onUpdate(current => { const typography = { ...current.settings?.typography, ...changes }; for (const key of Object.keys(typography)) if (typography[key] === '') delete typography[key]; return { ...current, settings: { ...current.settings, typography } } })} onReset={() => onUpdate(current => ({ ...current, settings: { ...current.settings, typography: {} } }))} /></details>
    {elements.map(element => <div key={element.elementId || element.role} className="mt-3"><p className="text-[11px] font-semibold text-amber-300">{element.label}</p><SectionTypographyControl project={project} section={section} {...element} availableFonts={fonts} onUploadFont={onUploadFont} onChange={changes => onUpdate(current => patchTypography(current, element.role, changes, element.elementId))} onReset={() => onUpdate(current => resetTypography(current, element.role, element.elementId))} /></div>)}
    <button type="button" onClick={() => onUpdate(current => resetTypography(current))} className="mt-3 text-xs text-textSecondary hover:text-amber-400">Reset all typography in this section</button>
  </details>
}

export function ProjectTypographyPanel({ project, onChange, onUploadFont }) {
  return <details className="rounded-xl border border-white/10 p-3"><summary className="cursor-pointer text-sm font-semibold text-white">Project typography defaults</summary><p className="mt-2 text-[10px] text-textSecondary">Inherited by all unmodified text roles in this case. Section overrides remain independent.</p>{TYPOGRAPHY_ROLES.map(element => <details key={element.id} className="mt-3"><summary className="cursor-pointer text-xs text-amber-300">{element.label}</summary><TypographyStyleEditor style={project.typography?.[element.id] || {}} sample={element.sample} availableFonts={projectFonts(project)} onUploadFont={onUploadFont} onChange={changes => onChange(element.id, changes)} onReset={() => onChange(element.id, null)} /></details>)}</details>
}
