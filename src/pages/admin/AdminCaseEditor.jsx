import ClientAccessPanel from '../../components/admin/ClientAccessPanel'
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { uploadMediaFile } from '../../api/mediaApi'
import SectionMediaPanel from '../../components/admin/SectionMediaPanel'
import SectionTypographyPanel, { ProjectTypographyPanel } from '../../components/admin/SectionTypographyPanel'
import SectionRenderer from '../../components/work/sections/SectionRenderer'
import HeroMasonryGrid from '../../components/work/HeroMasonryGrid'
import { selectDynamicHeroImages, shuffleGridImages, balanceGridImages } from '../../lib/heroSelector'
import { SUPPORTED_RATIOS, detectClosestRatio } from '../../lib/aspectRatios'
import { normalizeCase } from '../../lib/config'
import BulkPhotoImporterModal from '../../components/admin/BulkPhotoImporterModal'
import SectionTitle from '../../components/work/sections/SectionTitle'
import { blockId, createBlockId, createBlockInstance, deepClone, duplicateBlockInstance, reorderBlockInstances, updateBlockById } from '../../lib/caseBlocks'
import { parseVideoSource } from '../../lib/media'
import MediaVideo from '../../components/media/MediaVideo'
import DesignEmbedRenderer from '../../components/media/DesignEmbedRenderer'
import { DEFAULT_DESIGN_EMBED, parseDesignEmbed } from '../../lib/designEmbed'

export default function AdminCaseEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeSectionId, setActiveSectionId] = useState(null)
  const selectedIndex = project?.sections?.findIndex(section => blockId(section) === activeSectionId) ?? -1
  const activeSectionIdx = selectedIndex < 0 ? null : selectedIndex
  const setActiveSectionIdx = index => setActiveSectionId(index === null ? null : blockId(project?.sections?.[index]))
  const [activeTab, setActiveTab] = useState('metadata') // 'metadata', 'hero', 'sections'
  const [showAddSection, setShowAddSection] = useState(false)
  const [showAlbumPicker, setShowAlbumPicker] = useState(false)
  const [showBulkImporter, setShowBulkImporter] = useState(false)
  const [bulkImporterTarget, setBulkImporterTarget] = useState('album')
  const [albumPickerTarget, setAlbumPickerTarget] = useState('hero') // 'hero', 'gallery'
  const [albumRatioFilter, setAlbumRatioFilter] = useState('ALL') // 'ALL', '3:4', '4:3', '3:2', '2:3', '16:9', '9:16', '1:1'
  const [imageRatios, setImageRatios] = useState({})
  const [newSectionType, setNewSectionType] = useState('Rich Text')
  const [uploadingField, setUploadingField] = useState(null)
  const [isDirty, setIsDirty] = useState(false)
  const [validationErrors, setValidationErrors] = useState([])
  const previewChannel = useRef(null)
  const projectRef = useRef(null)
  const savedProjectJson = useRef(null)
  const arrangementHistory = useRef({})
  const sectionListRef = useRef(null)
  const draggedSectionIdRef = useRef(null)
  const sectionDropIndexRef = useRef(null)
  const [draggedSectionId, setDraggedSectionId] = useState(null)
  const [sectionDropIndex, setSectionDropIndex] = useState(null)

  const getSEOHealth = () => {
    let score = 0
    const checks = []

    if (project) {
      // 1. Title Checks
      if (project.title) {
        score += 20
        const titleLen = project.title.length
        if (titleLen >= 50 && titleLen <= 60) {
          score += 15
          checks.push({ ok: true, text: 'Title length is optimal (50-60 characters).' })
        } else {
          checks.push({ ok: false, text: `Title length (${titleLen} chars) should ideally be 50-60 characters.` })
        }
      } else {
        checks.push({ ok: false, text: 'Project title is missing.' })
      }

      // 2. Slug Checks
      if (project.slug) {
        score += 15
        checks.push({ ok: true, text: 'Slug is stable and configured.' })
      } else {
        checks.push({ ok: false, text: 'Slug identifier is missing.' })
      }

      // 3. Description Checks
      if (project.description) {
        score += 15
        const descLen = project.description.length
        if (descLen >= 120 && descLen <= 160) {
          score += 15
          checks.push({ ok: true, text: 'Meta description length is optimal (120-160 characters).' })
        } else {
          checks.push({ ok: false, text: `Meta description length (${descLen} chars) should ideally be 120-160 characters.` })
        }
      } else {
        checks.push({ ok: false, text: 'Meta description field is missing.' })
      }

      // 4. Cover Image Checks
      if (project.image) {
        score += 10
        checks.push({ ok: true, text: 'Main cover image is set.' })
      } else {
        checks.push({ ok: false, text: 'Main cover image is missing (required for OG previews).' })
      }

      // 5. Sections Layout Checks
      if (project.sections && project.sections.length > 0) {
        score += 10
        checks.push({ ok: true, text: 'Page layouts and content sections configured.' })
      } else {
        checks.push({ ok: false, text: 'No page layouts have been added to the case study.' })
      }
    }

    return { score, checks }
  }

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  useEffect(() => {
    if (!id || typeof BroadcastChannel === 'undefined') return undefined
    const channel = new BroadcastChannel(`ekdrishti-case-preview-${id}`)
    previewChannel.current = channel
    channel.onmessage = event => {
      if (event.data?.type === 'case-preview:hello' && projectRef.current) {
        channel.postMessage({ type: 'case-preview:update', project: projectRef.current })
      }
    }
    return () => { previewChannel.current = null; channel.close() }
  }, [id])

  useEffect(() => {
    projectRef.current = project
    if (project) {
      const isChanged = savedProjectJson.current !== null && JSON.stringify(project) !== savedProjectJson.current
      setIsDirty(current => current === isChanged ? current : isChanged)
      previewChannel.current?.postMessage({ type: 'case-preview:update', project })
    }
  }, [project])

  async function uploadFont(file) {
    if (!file) throw new Error('Choose a font file.')
    if (file.size > 10 * 1024 * 1024) throw new Error('Font files must be 10MB or smaller.')
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!['woff2', 'woff', 'ttf', 'otf'].includes(extension)) throw new Error('Choose a WOFF2, WOFF, TTF, or OTF font file.')
    const content = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('The font file could not be read.'))
      reader.readAsDataURL(file)
    })
    const response = await fetch('/v1/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ filename: file.name, fileType: file.type || `font/${extension}`, content })
    })
    const result = await response.json()
    if (!response.ok || !result.success) throw new Error(result.message || 'Font upload failed.')
    return result.data.fontUrl
  }

  const handleFileUpload = async (event, onComplete) => {
    const file = event.target.files?.[0]
    if (!file) return
    const fieldName = event.target.name || 'general'
    event.target.value = ''
    setUploadingField(fieldName)
    try {
      const result = await uploadMediaFile(file, token)
      onComplete(result.src, result.originalUrl)
    } catch (failure) {
      alert(`Media Upload error: ${failure.message}`)
    } finally {
      setUploadingField(null)
    }
  }

  const handleBulkImportComplete = (newUrls, target) => {
    if (!newUrls || newUrls.length === 0) return
    setIsDirty(true)
    setProject(prev => {
      let updated = { ...prev }
      const existingAlbum = updated.album || []
      const existingHero = updated.hero || []

      if (target === 'album' || target === 'both') {
        const uniqueAlbum = [...new Set([...existingAlbum, ...newUrls])]
        updated.album = uniqueAlbum
      }

      if (target === 'hero' || target === 'both') {
        const availableSlots = 20 - existingHero.length
        const toAdd = newUrls.slice(0, Math.max(0, availableSlots))
        updated.hero = [...existingHero, ...toAdd]
      }

      return updated
    })
  }

  useEffect(() => {
    fetchProject()
  }, [id])

  const fetchProject = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/v1/cases?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        const loadedProject = normalizeCase(data.data)
        projectRef.current = loadedProject
        savedProjectJson.current = JSON.stringify(loadedProject)
        arrangementHistory.current = Object.fromEntries((loadedProject.sections || []).map(section => [section.id, { baseline: (section.content?.images || []).map((item, i) => typeof item === 'string' ? item : item.id || item.src || item.url || String(i)), undo: [] }]))
        setProject(loadedProject)
        if (data.data.sections?.length > 0) {
          setActiveSectionId(blockId(loadedProject.sections[0]))
        }
      } else {
        throw new Error(data.message || 'Failed to load project details')
      }
    } catch (err) {
      setError(err.message || 'Error fetching case study details.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaveLoading(true)
    setError('')
    setSuccess('')
    setValidationErrors([])

    // Validate only if published (drafts bypass validation checks)
    const errors = []
    if (!project.title?.trim()) errors.push("Project Title is required")
    if (!project.slug?.trim()) errors.push("Slug is required")
    if (!project.image && (!project.hero || project.hero.length === 0) && (!project.album || project.album.length === 0)) {
      errors.push("At least one cover image or album/hero photo is required before publishing")
    }

    if (project.status === 'published' && errors.length > 0) {
      setValidationErrors(errors)
      setSaveLoading(false)
      return
    }

    const cleanHero = Array.isArray(project.hero) ? deepClone(project.hero) : []

    const payload = {
      ...project,
      hero: cleanHero,
      heroSettings: project.heroSettings || {}
    }

    try {
      const res = await fetch(`/v1/cases?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.success) {
        setSuccess('Case study saved successfully!')
        const savedProject = normalizeCase(data.data)
        projectRef.current = savedProject
        savedProjectJson.current = JSON.stringify(savedProject)
        setProject(savedProject)
        setIsDirty(false)
        setTimeout(() => setSuccess(''), 4000)
      } else {
        throw new Error(data.message || 'Failed to save case study')
      }
    } catch (err) {
      setError(err.message || 'Error occurred saving changes.')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleMetadataChange = (e) => {
    const { name, value, type, checked } = e.target
    setIsDirty(true)
    setProject(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleNestedMetadataChange = (parent, field, value) => {
    setIsDirty(true)
    setProject(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }))
  }

  const getEffectiveHeroImages = () => {
    if (Array.isArray(project?.hero) && project.hero.length > 0) {
      return project.hero.map(h => (typeof h === 'string' ? h : (h?.url || h?.src || ''))).filter(Boolean)
    }
    return selectDynamicHeroImages(project, { min: 1, max: 20 }).images
  }

  const handleUpdateHeroItemSize = (index, newSizeConfig) => {
    setIsDirty(true)
    setProject(prev => {
      const currentHero = (prev.hero && prev.hero.length > 0)
        ? prev.hero.map(h => (typeof h === 'string' ? h : (h?.url || h?.src || ''))).filter(Boolean)
        : getEffectiveHeroImages()
      if (index < 0 || index >= currentHero.length) return prev

      const src = currentHero[index]

      const heroSettings = { ...(prev.heroSettings || {}) }
      heroSettings[src] = { ...(heroSettings[src] || {}), ...newSizeConfig }
      heroSettings[index] = { ...(heroSettings[index] || {}), ...newSizeConfig }

      return {
        ...prev,
        hero: currentHero,
        heroSettings
      }
    })
  }

  const handleBatchResizeHero = (ratio) => {
    setIsDirty(true)
    setProject(prev => {
      const currentHero = (prev.hero && prev.hero.length > 0)
        ? prev.hero.map(h => (typeof h === 'string' ? h : (h?.url || h?.src || ''))).filter(Boolean)
        : getEffectiveHeroImages()
      const heroSettings = { ...(prev.heroSettings || {}) }

      currentHero.forEach((src, idx) => {
        heroSettings[src] = { ...(heroSettings[src] || {}), aspectRatio: ratio }
        heroSettings[idx] = { ...(heroSettings[idx] || {}), aspectRatio: ratio }
      })

      return {
        ...prev,
        hero: currentHero,
        heroSettings
      }
    })
  }

  const handleShuffleHero = () => {
    const current = getEffectiveHeroImages()
    if (current.length <= 1) return
    const shuffled = shuffleGridImages(current)
    setIsDirty(true)
    setProject(prev => ({ ...prev, hero: shuffled }))
  }

  const handleSmartBalanceHero = () => {
    const current = getEffectiveHeroImages()
    if (current.length <= 1) return
    const balanced = balanceGridImages(current)
    setIsDirty(true)
    setProject(prev => ({ ...prev, hero: balanced }))
  }

  // --- SECTION BUILDER METHODS ---

  const updateSectionInstance = (sectionId, updater) => {
    setProject(previous => ({ ...previous, sections: updateBlockById(previous.sections, sectionId, updater) }))
    setIsDirty(true)
  }

  const handleAddSection = () => {
    setIsDirty(true)
    const newSection = createBlockInstance({
      type: newSectionType,
      order: (project.sections?.length || 0) + 1,
      title: `${newSectionType} Section`,
      content: getSectionDefaultContent(newSectionType),
      metadata: {}
    })

    setProject(prev => {
      const sections = prev.sections ? [...prev.sections, newSection] : [newSection]
      return { ...prev, sections }
    })

    setActiveSectionId(newSection.id)
    setActiveTab('sections')
    setShowAddSection(false)
  }

  const handleDeleteSection = (index) => {
    if (!window.confirm('Delete this section layout?')) return
    setIsDirty(true)
    const sectionId = blockId(project.sections[index])
    setProject(prev => {
      const sections = prev.sections.filter(section => blockId(section) !== sectionId)
      // Recalculate ordering
      const reordered = sections.map((s, idx) => ({ ...s, order: idx + 1 }))
      return { ...prev, sections: reordered }
    })
    if (activeSectionId === blockId(project.sections[index])) setActiveSectionId(null)
  }

  const handleDuplicateSection = (index) => {
    setIsDirty(true)
    const source = project.sections[index]
    const clone = duplicateBlockInstance(source, index + 2)
    setProject(prev => {
      const sections = [...prev.sections]
      sections.splice(index + 1, 0, clone)
      return { ...prev, sections: sections.map((section, sectionIndex) => ({ ...section, order: sectionIndex + 1 })) }
    })
    setActiveSectionId(clone.id)
  }

  const reorderSection = (sectionId, insertionIndex) => {
    if (!sectionId || insertionIndex === null) return
    const currentSourceIndex = project.sections.findIndex(section => blockId(section) === sectionId)
    if (currentSourceIndex < 0) return
    setProject(prev => ({ ...prev, sections: reorderBlockInstances(prev.sections, sectionId, insertionIndex) }))
    setActiveSectionId(sectionId)
    setIsDirty(true)
  }

  const finishSectionDrag = (insertionIndex = sectionDropIndexRef.current) => {
    reorderSection(draggedSectionIdRef.current, insertionIndex)
    draggedSectionIdRef.current = null
    setDraggedSectionId(null)
    setSectionDropIndex(null)
    sectionDropIndexRef.current = null
  }

  const updateSectionDropTarget = (clientY, row, index) => {
    const rect = row.getBoundingClientRect()
    const nextDropIndex = clientY < rect.top + rect.height / 2 ? index : index + 1
    sectionDropIndexRef.current = nextDropIndex
    setSectionDropIndex(nextDropIndex)
    const list = sectionListRef.current
    if (!list) return
    const listRect = list.getBoundingClientRect()
    if (clientY < listRect.top + 42) list.scrollTop -= 14
    else if (clientY > listRect.bottom - 42) list.scrollTop += 14
  }

  const handleSectionKeyboardReorder = (event, index) => {
    if (!event.altKey || !['ArrowUp', 'ArrowDown'].includes(event.key)) return
    event.preventDefault()
    const target = event.key === 'ArrowUp' ? index - 1 : index + 2
    if (target < 0 || target > project.sections.length) return
    reorderSection(blockId(project.sections[index]), target)
  }

  const handleToggleSectionEnabled = (index) => {
    const sectionId = blockId(project.sections[index])
    updateSectionInstance(sectionId, section => ({ ...section, enabled: section.enabled === false }))
  }

  const handleSectionFieldChange = (field, value) => {
    const sectionId = blockId(project.sections[activeSectionIdx])
    updateSectionInstance(sectionId, section => ({ ...section, content: { ...section.content, [field]: value } }))
  }

  const handleSectionSettingsChange = (field, value) => {
    const sectionId = blockId(project.sections[activeSectionIdx])
    updateSectionInstance(sectionId, section => ({ ...section, settings: { ...section.settings, [field]: deepClone(value) } }))
  }

  const getSectionDefaultContent = (type) => {
    switch (type) {
      case 'Hero':
        return { images: deepClone(project.hero?.length ? project.hero : getEffectiveHeroImages()) }
      case 'Rich Text':
      case 'Story':
        return {
          heading: 'About The Project',
          text: project?.description ? `<p>${project.description}</p>` : '<p>Enter rich project story or editorial narrative here...</p>'
        }
      case 'Results':
      case 'Stats':
        return {
          metric1: project?.results?.metric1 || '2 Highlight Reels Produced',
          metric2: project?.results?.metric2 || 'Full Event Photo Coverage',
          metric3: project?.results?.metric3 || '4K Cinematic Delivery'
        }
      case 'Gallery':
        return { images: [] }
      case 'Image Section':
        return { images: [], caption: '' }
      case 'Video':
        return {
          url: project?.youtubeUrl || project?.video || '',
          aspectRatio: project?.aspectRatio || '16/9'
        }
      case 'Design Embed':
        return { url: '' }
      case 'CTA':
        return {
          heading: 'Ready to Capture Your Moments?',
          description: 'Get in touch with our team for bespoke photography and video production services.',
          buttonText: 'Contact Us',
          link: '/contact'
        }
      case 'Testimonial':
        return {
          quote: 'Ekdrishti captured every emotion and special moment with breathtaking perfection.',
          author: project?.client || 'Client Name',
          role: 'Wedding & Event'
        }
      case 'Album Gallery':
        return { images: deepClone(project?.album || []) }
      case 'Client Access':
        return { title: 'Client Downloads' }
      default:
        return {}
    }
  }

  const handlePopulateStandardLayout = () => {
    const defaultSections = [
      {
        type: 'Hero',
        enabled: true,
        order: 1,
        title: 'Hero Showcase',
        content: {}
      },
      {
        type: 'Rich Text',
        enabled: true,
        order: 2,
        title: 'Project Story & Overview',
        content: {
          heading: 'The Story',
          text: `<p>${project.description || 'Ekdrishti Studios captured every memorable moment of this extraordinary event with cinematic finesse and artistic precision.'}</p>`
        }
      }
    ]

    let nextOrder = 3

    if (project.results?.metric1 || project.results?.metric2 || project.results?.metric3) {
      defaultSections.push({
        type: 'Results',
        enabled: true,
        order: nextOrder++,
        title: 'Key Highlights',
        content: {
          metric1: project.results?.metric1 || '',
          metric2: project.results?.metric2 || '',
          metric3: project.results?.metric3 || ''
        }
      })
    }

    if (project.hasVideo || project.youtubeUrl || project.video) {
      defaultSections.push({
        type: 'Video',
        enabled: true,
        order: nextOrder++,
        title: 'Event Highlights Video',
        content: {
          url: project.youtubeUrl || project.video || '',
          aspectRatio: project.aspectRatio || '16/9'
        }
      })
    }

    if (project.album && project.album.length > 0) {
      defaultSections.push({
        type: 'Image Section',
        enabled: true,
        order: nextOrder++,
        title: 'Album Gallery',
        content: { images: project.album }
      })
    }

    if (project.driveLinks?.allFiles) {
      defaultSections.push({
        type: 'Client Access',
        enabled: true,
        order: nextOrder++,
        title: 'Client Downloads',
        content: {}
      })
    }

    defaultSections.push({
      type: 'CTA',
      enabled: true,
      order: nextOrder++,
      title: 'Call To Action',
      content: {
        heading: 'Ready to Capture Your Story?',
        description: 'Contact Ekdrishti Studios for bespoke photography and video production.',
        buttonText: 'Contact Us',
        link: '/contact'
      }
    })

    setIsDirty(true)
    const createdSections = defaultSections.map(section => createBlockInstance({ ...section, content: section.type === 'Hero' ? { ...section.content, images: deepClone(getEffectiveHeroImages()) } : section.content }))
    setProject(prev => ({ ...prev, sections: createdSections }))
    setActiveSectionId(createdSections[0]?.id || null)
    setActiveTab('sections')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mb-2"></div>
          <p className="text-textSecondary text-xs">Loading case study editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* HEADER & SAVES */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-textSecondary mb-1">
            <Link to="/ownercontrols_panel/cases" className="hover:text-amber-400">Case Studies</Link>
            <span>/</span>
            <span className="text-textPrimary truncate max-w-[150px]">{project.title}</span>
          </div>
          <h1 className="text-2xl font-heading font-black text-white truncate max-w-[400px] flex items-center gap-3">
            {project.title}
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${isDirty ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isDirty ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
              {isDirty ? 'Unsaved changes' : 'Saved'}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/work/${project.slug}?preview=1&previewId=${encodeURIComponent(id)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => previewChannel.current?.postMessage({ type: 'case-preview:update', project })}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold py-2.5 px-4 rounded-xl transition-all"
          >
            👁️  Live Preview
          </a>
          <button
            onClick={handleSave}
            disabled={saveLoading}
            className="bg-amber-500 hover:bg-amber-400 text-primary font-bold py-2.5 px-5 rounded-xl transition-all text-xs disabled:opacity-50"
          >
            {saveLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs space-y-1">
          <p className="font-bold">⚠️ Cannot Publish Case Study — Validation Failed:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          ⚠️  {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          ✓  {success}
        </div>
      )}

      {/* EDITOR LAYOUT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN: NAVIGATION / SECTIONS LIST */}
        <div className="lg:col-span-1 bg-[#0F172A]/40 border border-white/5 rounded-2xl p-4 flex flex-col h-fit">
          <div className="grid grid-cols-3 gap-1 bg-[#0B1120] p-1 rounded-xl border border-white/5 text-[10px] text-center font-bold font-heading mb-4">
            <button
              onClick={() => setActiveTab('metadata')}
              className={`py-1.5 rounded-lg transition-all ${activeTab === 'metadata' ? 'bg-amber-500 text-primary' : 'text-textSecondary hover:text-textPrimary'
                }`}
            >
              📄 Metadata
            </button>
            <button
              onClick={() => setActiveTab('hero')}
              className={`py-1.5 rounded-lg transition-all relative ${activeTab === 'hero' ? 'bg-amber-500 text-primary' : 'text-textSecondary hover:text-textPrimary'
                }`}
            >
              🖼️ Hero Grid
              {project?.hero?.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-black/40 text-[9px] font-mono">
                  {project.hero.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('sections')}
              className={`py-1.5 rounded-lg transition-all relative ${activeTab === 'sections' ? 'bg-amber-500 text-primary' : 'text-textSecondary hover:text-textPrimary'
                }`}
            >
              🧩 Layout & Sequence
              {project?.sections?.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-black/40 text-[9px] font-mono">
                  {project.sections.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'hero' && project.sections?.some(section => section.type === 'Hero') ? (<div className="space-y-3 text-xs"><p className="text-textSecondary">Each Hero block has its own media and configuration.</p>{project.sections.filter(section => section.type === 'Hero').map(section => <button key={blockId(section)} type="button" onClick={() => setActiveSectionId(blockId(section))} className={`block w-full rounded-lg border px-3 py-3 text-left ${activeSectionId === blockId(section) ? 'border-amber-400 text-amber-300' : 'border-white/10 text-white'}`}>{section.title || 'Hero'} · {section.content?.images?.length || 0} images</button>)}</div>) : activeTab === 'hero' ? (
            <div className="space-y-4 text-[11px]">
              <div className="p-3 bg-[#0B1120] rounded-xl border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white uppercase tracking-wider text-[10px]">
                    Hero Grid Config
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${(project?.hero?.length || 0) >= 1 && (project?.hero?.length || 0) <= 20
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : (project?.hero?.length || 0) === 0
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                    {project?.hero?.length || 0} / 20 Images
                  </span>
                </div>
                <p className="text-textSecondary text-[10px] leading-relaxed">
                  {(project?.hero?.length || 0) === 0
                    ? 'Default auto mode: The front-end automatically uses the first 1–20 photos from the album in dynamic masonry.'
                    : '✓ Configured with optimal count (1 to 20 images of any orientation). Click 📐 Resize on any card to customize size.'}
                </p>

                {/* Supported Aspect Ratios Pill Strip */}
                <div className="pt-1 border-t border-white/5">
                  <span className="text-[9px] font-bold text-textSecondary uppercase tracking-wider block mb-1">
                    Supported Image Ratios:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {['3:4', '4:3', '3:2', '2:3', '16:9', '9:16', '1:1', 'Auto'].map((r) => (
                      <span key={r} className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-mono text-amber-400 font-semibold">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setBulkImporterTarget('hero')
                    setShowBulkImporter(true)
                  }}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-primary font-black rounded-xl transition-all shadow-lg shadow-amber-500/10 text-xs flex items-center justify-center gap-2"
                >
                  <span>⚡</span> Bulk Import to Hero (Drive & Dropzone)
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <label className="py-2 px-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all cursor-pointer text-center text-xs flex items-center justify-center gap-1.5">
                    {uploadingField === 'hero-upload' ? '...' : '📁 Single File'}
                    <input
                      type="file"
                      accept="image/*"
                      name="hero-upload"
                      onChange={(e) => handleFileUpload(e, (webpUrl) => {
                        setIsDirty(true)
                        setProject(prev => {
                          const current = prev.hero || []
                          if (current.length >= 20) {
                            alert('Maximum 20 hero images allowed.')
                            return prev
                          }
                          return { ...prev, hero: [...current, webpUrl] }
                        })
                      })}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowAlbumPicker(true)}
                    className="py-2 px-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5"
                  >
                    📚 From Album ({project?.album?.length || 0})
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!project?.album || project.album.length === 0) {
                        alert('Album is empty. Add album images first.')
                        return
                      }
                      const first10 = project.album.slice(0, 10)
                      setIsDirty(true)
                      setProject(prev => ({ ...prev, hero: first10 }))
                    }}
                    className="py-2 px-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] text-textSecondary hover:text-white transition-all text-center font-semibold"
                  >
                    ⚡ Auto 10 from Album
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!project?.album || project.album.length === 0) {
                        alert('Album is empty. Add album images first.')
                        return
                      }
                      const first20 = project.album.slice(0, 20)
                      setIsDirty(true)
                      setProject(prev => ({ ...prev, hero: first20 }))
                    }}
                    className="py-2 px-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] text-textSecondary hover:text-white transition-all text-center font-semibold"
                  >
                    ⚡ Auto 20 from Album
                  </button>
                </div>

                {project?.hero?.length > 1 && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleShuffleHero}
                      className="py-2 px-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-[10px] text-amber-400 font-bold transition-all text-center flex items-center justify-center gap-1"
                      title="Shuffle hero image positions randomly"
                    >
                      🎲 Shuffle Grid
                    </button>
                    <button
                      type="button"
                      onClick={handleSmartBalanceHero}
                      className="py-2 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-[10px] text-emerald-400 font-bold transition-all text-center flex items-center justify-center gap-1"
                      title="Smart balance portraits & landscapes across columns"
                    >
                      ✨ Smart Balance
                    </button>
                  </div>
                )}

                {project?.hero?.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Delete all custom hero images and revert to automatic album fallback?')) {
                        setIsDirty(true)
                        setProject(prev => ({ ...prev, hero: [] }))
                      }
                    }}
                    className="w-full py-1.5 px-2 text-red-400 hover:text-red-300 text-[10px] text-center transition-colors hover:underline"
                  >
                    🗑️ Delete All Hero Images (Clear Grid)
                  </button>
                )}
              </div>

              {/* Direct URLs Textarea */}
              <div className="border-t border-white/5 pt-3 space-y-1.5">
                <label className="block text-textSecondary font-semibold uppercase tracking-wide text-[10px]">
                  Direct Image URLs (1 per line, max 20)
                </label>
                <textarea
                  rows="4"
                  value={(project?.hero || []).map(h => (typeof h === 'string' ? h : (h?.url || h?.src || ''))).filter(Boolean).join('\n')}
                  onChange={(e) => {
                    const urls = e.target.value.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 20)
                    setIsDirty(true)
                    setProject(prev => ({ ...prev, hero: urls }))
                  }}
                  placeholder="https://...\nhttps://..."
                  className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary text-[10px] font-mono focus:outline-none"
                />
              </div>
            </div>
          ) : activeTab === 'metadata' ? (
            <div className="space-y-4 text-[11px]">
              <div>
                <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Case Title</label>
                <input
                  type="text"
                  name="title"
                  value={project.title || ''}
                  onChange={handleMetadataChange}
                  className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary focus:outline-none focus:border-amber-500/60"
                />
              </div>
              <div>
                <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Slug</label>
                <input
                  type="text"
                  name="slug"
                  value={project.slug || ''}
                  onChange={handleMetadataChange}
                  className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary focus:outline-none focus:border-amber-500/60 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Category</label>
                  <select
                    name="category"
                    value={project.category || 'EVENTS'}
                    onChange={handleMetadataChange}
                    className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary focus:outline-none focus:border-amber-500/60"
                  >
                    <option value="EVENTS">EVENTS</option>
                    <option value="PRODUCTION">PRODUCTION</option>
                    <option value="DIGITAL MARKETING">DIGITAL MARKETING</option>
                  </select>
                </div>
                <div>
                  <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Client</label>
                  <input
                    type="text"
                    name="client"
                    value={project.client || ''}
                    onChange={handleMetadataChange}
                    className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Visibility Status</label>
                <select
                  name="status"
                  value={project.status || 'draft'}
                  onChange={handleMetadataChange}
                  className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary focus:outline-none focus:border-amber-500/60"
                >
                  <option value="published">Listed (Published on Website)</option>
                  <option value="draft">Unlisted (Draft - Admin Only)</option>
                  <option value="archived">Archived (Hidden from Listing)</option>
                </select>
              </div>
              <div>
                <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Short Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={project.description || ''}
                  onChange={handleMetadataChange}
                  className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 bg-[#0B1120] border border-white/5 rounded-xl">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={project.featured || false}
                    onChange={handleMetadataChange}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="featured" className="text-white font-semibold cursor-pointer">Featured Case</label>
                </div>
                <div>
                  <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Priority (0-100)</label>
                  <input
                    type="number"
                    name="priority"
                    value={project.priority || 0}
                    onChange={handleMetadataChange}
                    className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary focus:outline-none"
                  />
                </div>
              </div>

              {/* Cover & Thumbnail Images */}
              <div className="grid grid-cols-1 gap-3 border-t border-white/5 pt-3">
                <div>
                  <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Cover Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="image"
                      value={project.image || ''}
                      onChange={handleMetadataChange}
                      className="flex-1 px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary text-[10px] focus:outline-none font-mono"
                    />
                    <label className="bg-amber-500 hover:bg-amber-400 text-primary font-bold px-3 py-2 rounded-xl transition-all cursor-pointer text-center text-[10px] flex items-center justify-center min-w-[70px]">
                      {uploadingField === 'image' ? '...' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        name="image"
                        onChange={(e) => handleFileUpload(e, (webpUrl) => {
                          setProject(prev => ({ ...prev, image: webpUrl }))
                        })}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Thumbnail 16:9 URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="thumbnail169"
                      value={project.thumbnail169 || ''}
                      onChange={handleMetadataChange}
                      className="flex-1 px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary text-[10px] focus:outline-none font-mono"
                    />
                    <label className="bg-amber-500 hover:bg-amber-400 text-primary font-bold px-3 py-2 rounded-xl transition-all cursor-pointer text-center text-[10px] flex items-center justify-center min-w-[70px]">
                      {uploadingField === 'thumbnail169' ? '...' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        name="thumbnail169"
                        onChange={(e) => handleFileUpload(e, (webpUrl) => {
                          setProject(prev => ({ ...prev, thumbnail169: webpUrl, thumbnail: webpUrl }))
                        })}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Thumbnail 3:2 URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="thumbnail32"
                      value={project.thumbnail32 || ''}
                      onChange={handleMetadataChange}
                      className="flex-1 px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary text-[10px] focus:outline-none font-mono"
                    />
                    <label className="bg-amber-500 hover:bg-amber-400 text-primary font-bold px-3 py-2 rounded-xl transition-all cursor-pointer text-center text-[10px] flex items-center justify-center min-w-[70px]">
                      {uploadingField === 'thumbnail32' ? '...' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        name="thumbnail32"
                        onChange={(e) => handleFileUpload(e, (webpUrl) => {
                          setProject(prev => ({ ...prev, thumbnail32: webpUrl }))
                        })}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Album List */}
              <div className="border-t border-white/5 pt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-textSecondary font-semibold uppercase tracking-wide">Album / Gallery Library</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setBulkImporterTarget('album')
                        setShowBulkImporter(true)
                      }}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-primary font-bold rounded-lg text-[10px] flex items-center gap-1 shadow"
                    >
                      <span>⚡</span> Bulk Import (Drive & Drop)
                    </button>
                    <label className="text-[10px] text-amber-400 hover:underline cursor-pointer bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                      {uploadingField === 'album-add' ? '...' : '＋ Single'}
                      <input
                        type="file"
                        accept="image/*"
                        name="album-add"
                        onChange={(e) => handleFileUpload(e, (webpUrl) => {
                          setProject(prev => ({
                            ...prev,
                            album: prev.album ? [...prev.album, webpUrl] : [webpUrl]
                          }))
                        })}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 max-h-[140px] overflow-y-auto p-1 bg-[#0B1120] rounded-xl border border-white/5">
                  {(!project.album || project.album.length === 0) ? (
                    <div className="col-span-4 text-center py-4 text-textSecondary text-[10px]">No album images.</div>
                  ) : (
                    project.album.map((img, idx) => (
                      <div key={idx} className="relative aspect-square bg-white/5 rounded-lg overflow-hidden group border border-white/5">
                        <img src={typeof img === 'string' ? img : img.src || img.url} alt="album" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <button
                          type="button"
                          onClick={() => setProject(prev => ({
                            ...prev,
                            album: prev.album.filter((_, i) => i !== idx)
                          }))}
                          className="absolute inset-0 bg-red-500/80 text-white font-bold text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              {/* SECTION TILES & SEQUENCE */}
              <div ref={sectionListRef} className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 scroll-smooth">
                {(!project.sections || project.sections.length === 0) ? (
                  <div className="text-center py-8 px-4 bg-[#0B1120] rounded-2xl border border-white/5 space-y-3">
                    <p className="text-textSecondary text-xs">No sections configured yet.</p>
                    <p className="text-[11px] text-textSecondary/70">
                      You can click below to generate the complete standard layout from existing case data or add custom sections manually.
                    </p>
                    <button
                      type="button"
                      onClick={handlePopulateStandardLayout}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-primary font-bold text-xs rounded-xl shadow transition-all"
                    >
                      ✨ Populate Standard Layout
                    </button>
                  </div>
                ) : (
                  project.sections.map((sec, idx) => {
                    const secType = (sec.type || '').toLowerCase()
                    const typeColor =
                      secType.includes('hero') ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                        secType.includes('rich') || secType.includes('story') ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                          secType.includes('result') || secType.includes('stat') ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                            secType.includes('video') ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                              secType.includes('embed') ? 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30' :
                              secType.includes('gallery') || secType.includes('image') ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                                secType.includes('cta') ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' :
                                  secType.includes('testimonial') || secType.includes('quote') ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' :
                                    'bg-white/10 text-white border-white/20'

                    const typeIcon =
                      secType.includes('hero') ? '🖼️' :
                        secType.includes('rich') || secType.includes('story') ? '📝' :
                          secType.includes('result') || secType.includes('stat') ? '📊' :
                            secType.includes('video') ? '🎬' :
                              secType.includes('embed') ? '🎨' :
                              secType.includes('gallery') ? '📸' :
                                secType.includes('cta') ? '⚡' :
                                  secType.includes('testimonial') || secType.includes('quote') ? '💬' :
                                    secType.includes('album') ? '📚' : '📦'

                    return (
                      <div key={blockId(sec)} className="relative">
                        {draggedSectionId && sectionDropIndex === idx && <div className="absolute -top-[6px] inset-x-2 z-20 h-0.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />}
                        <div
                          data-section-id={blockId(sec)}
                          draggable
                          onDragStart={event => {
                            if (event.target.closest('button,input,select,textarea,a')) { event.preventDefault(); return }
                            draggedSectionIdRef.current = blockId(sec)
                            setDraggedSectionId(blockId(sec))
                            sectionDropIndexRef.current = idx
                            setSectionDropIndex(idx)
                            event.dataTransfer.effectAllowed = 'move'
                            event.dataTransfer.setData('text/plain', blockId(sec))
                          }}
                          onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; updateSectionDropTarget(event.clientY, event.currentTarget, idx) }}
                          onDrop={event => { event.preventDefault(); finishSectionDrag() }}
                          onDragEnd={() => { draggedSectionIdRef.current = null; sectionDropIndexRef.current = null; setDraggedSectionId(null); setSectionDropIndex(null) }}
                          className={`group p-3 rounded-xl border flex items-center justify-between gap-3 text-xs cursor-grab transition-[transform,opacity,box-shadow,border-color,background-color] duration-200 active:cursor-grabbing ${draggedSectionId === blockId(sec) ? 'relative z-10 scale-[1.01] opacity-80 shadow-xl shadow-black/30' : ''} ${activeSectionIdx === idx
                              ? 'bg-amber-500/10 border-amber-500/40 shadow-md ring-1 ring-amber-500/30'
                              : 'bg-[#0B1120] border-white/5 text-textSecondary hover:text-textPrimary hover:border-white/15'
                            }`}
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer" onClick={() => setActiveSectionIdx(idx)}>
                            <div className="relative flex h-6 w-6 flex-shrink-0 items-center justify-center">
                              <span className="rounded-lg border border-white/10 bg-white/5 px-1.5 py-1 font-mono text-[10px] font-bold text-textSecondary transition-opacity group-hover:opacity-0 group-focus-within:opacity-0">{String(idx + 1).padStart(2, '0')}</span>
                              <button
                                type="button"
                                draggable
                                aria-label={`Reorder ${sec.title || sec.type}. Hold Alt and press the up or down arrow key.`}
                                title="Drag to reorder · Alt + Arrow keys"
                                onClick={event => event.stopPropagation()}
                                onDragStart={event => {
                                  event.stopPropagation()
                                  draggedSectionIdRef.current = blockId(sec)
                                  sectionDropIndexRef.current = idx
                                  setDraggedSectionId(blockId(sec))
                                  setSectionDropIndex(idx)
                                  event.dataTransfer.effectAllowed = 'move'
                                  event.dataTransfer.setData('text/plain', blockId(sec))
                                }}
                                onKeyDown={event => handleSectionKeyboardReorder(event, idx)}
                                onPointerDown={event => {
                                  if (event.pointerType === 'mouse') return
                                  event.stopPropagation()
                                  draggedSectionIdRef.current = blockId(sec)
                                  sectionDropIndexRef.current = idx
                                  setDraggedSectionId(blockId(sec))
                                  setSectionDropIndex(idx)
                                  event.currentTarget.setPointerCapture(event.pointerId)
                                }}
                                onPointerMove={event => {
                                  if (!draggedSectionIdRef.current || event.pointerType === 'mouse') return
                                  const row = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-section-id]')
                                  if (row) updateSectionDropTarget(event.clientY, row, project.sections.findIndex(section => blockId(section) === row.dataset.sectionId))
                                }}
                                onPointerUp={event => { if (event.pointerType !== 'mouse' && draggedSectionIdRef.current) finishSectionDrag() }}
                                className="absolute inset-0 flex touch-none items-center justify-center text-base text-amber-400 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 cursor-grab active:cursor-grabbing"
                              >⠿</button>
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white truncate flex items-center gap-1.5"><span>{typeIcon}</span><span className="truncate">{sec.title || `${sec.type} Section`}</span></p>
                              <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-mono border mt-0.5 ${typeColor}`}>{secType.includes('embed') ? 'Embed' : sec.type}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button type="button" onClick={() => handleToggleSectionEnabled(idx)} className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-all ${sec.enabled !== false ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`} title="Toggle visibility">{sec.enabled !== false ? 'ON' : 'OFF'}</button>
                            <button type="button" onClick={() => handleDuplicateSection(idx)} className="p-1 hover:text-amber-400 transition-colors" title="Duplicate">🗐</button>
                            <button type="button" onClick={() => handleDeleteSection(idx)} className="p-1 hover:text-red-400 transition-colors" title="Delete">🗑️</button>
                          </div>
                        </div>
                        {draggedSectionId && sectionDropIndex === project.sections.length && idx === project.sections.length - 1 && <div className="absolute -bottom-[6px] inset-x-2 z-20 h-0.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />}
                      </div>
                    )
                  })
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="border-t border-white/5 pt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowAddSection(true)}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-primary rounded-xl font-bold transition-all text-xs shadow"
                >
                  ＋  Add Section Block
                </button>
                <div className="flex items-center justify-between text-[11px] text-textSecondary px-1">
                  <button
                    type="button"
                    onClick={handlePopulateStandardLayout}
                    className="text-amber-400 hover:underline"
                  >
                    ✨ Populate Standard Layout
                  </button>
                  {project.sections?.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Clear all custom sections?')) {
                          setIsDirty(true)
                          setProject(prev => ({ ...prev, sections: [] }))
                          setActiveSectionIdx(null)
                        }
                      }}
                      className="text-red-400 hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DETAIL EDIT FORM */}
        <div className="lg:col-span-2 bg-[#0F172A]/40 border border-white/5 rounded-2xl p-6">
          {activeTab === 'hero' ? (
            (() => {
              const section = project.sections?.find(item => blockId(item) === activeSectionId && item.type === 'Hero') || project.sections?.find(item => item.type === 'Hero')
              if (!section) return <HeroMasonryGrid images={getEffectiveHeroImages()} heroSettings={project.heroSettings || {}} editable onReorder={images => setProject(previous => ({ ...previous, hero: images }))} title={project.title} />
              const sectionId = blockId(section)
              const update = updater => updateSectionInstance(sectionId, updater)
              return <div key={sectionId} className="space-y-4"><h2 className="text-lg font-bold text-white">{section.title}</h2><SectionMediaPanel onUploadFont={uploadFont} arrangementHistory={arrangementHistory.current} section={section} project={project} onUpdate={update} onUploadFile={file => uploadMediaFile(file, token)} /></div>
            })()
          ) : activeTab === 'sections' && activeSectionIdx !== null && project.sections?.[activeSectionIdx] ? (
            <div className="space-y-6 text-xs">
              {/* SECTION HEADER */}
              <div className="border-b border-white/5 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                    <span>Block #{activeSectionIdx + 1}:</span>
                    <SectionTitle as="span" section={project.sections[activeSectionIdx]} project={project}>{project.sections[activeSectionIdx].title}</SectionTitle>
                  </h2>
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-mono mt-1 inline-block">
                    Type: {project.sections[activeSectionIdx].type}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSectionEnabled(activeSectionIdx)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${project.sections[activeSectionIdx].enabled !== false
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}
                >
                  {project.sections[activeSectionIdx].enabled !== false ? 'Active in Page (ON)' : 'Hidden (OFF)'}
                </button>
              </div>

              {/* SECTION EDIT FORM FIELDS */}
              <div className="space-y-5">
                {/* Section title */}
                <div>
                  <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Section Identifier Title</label>
                  <input
                    type="text"
                    value={project.sections[activeSectionIdx].title || ''}
                    onChange={(e) => {
                      const val = e.target.value
                      updateSectionInstance(blockId(project.sections[activeSectionIdx]), section => ({ ...section, title: val }))
                    }}
                    className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary focus:outline-none focus:border-amber-500/60 font-semibold"
                  />

                </div>

                {/* Hero owns its media, modes and preview. */}
                {project.sections[activeSectionIdx].type === 'Hero' && <SectionMediaPanel onUploadFont={uploadFont} arrangementHistory={arrangementHistory.current} key={activeSectionId} section={project.sections[activeSectionIdx]} project={project} onUpdate={updater => updateSectionInstance(activeSectionId, updater)} onUploadFile={file => uploadMediaFile(file, token)} />}

                {/* 2. RICH TEXT / STORY */}
                {(project.sections[activeSectionIdx].type === 'Rich Text' || project.sections[activeSectionIdx].type === 'Story') && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Story Heading</label>
                      <input
                        type="text"
                        value={project.sections[activeSectionIdx].content?.heading || ''}
                        onChange={(e) => handleSectionFieldChange('heading', e.target.value)}
                        placeholder="e.g. The Story, Vision & Execution"
                        className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary focus:outline-none"
                      />

                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-textSecondary font-semibold uppercase tracking-wide">Story Content (HTML / Text)</label>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const current = project.sections[activeSectionIdx].content?.text || ''
                              handleSectionFieldChange('text', `${current}\n<p>New narrative paragraph...</p>`)
                            }}
                            className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-[10px] rounded text-textSecondary hover:text-white"
                          >
                            + Paragraph
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const current = project.sections[activeSectionIdx].content?.text || ''
                              handleSectionFieldChange('text', `${current}\n<h4 class="text-amber-400 font-bold text-lg">Subheading</h4>`)
                            }}
                            className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-[10px] rounded text-textSecondary hover:text-white"
                          >
                            + Subheading
                          </button>
                        </div>
                      </div>
                      <textarea
                        rows="7"
                        value={project.sections[activeSectionIdx].content?.text || ''}
                        onChange={(e) => handleSectionFieldChange('text', e.target.value)}
                        className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary focus:outline-none font-mono text-xs"
                      />

                    </div>
                  </div>
                )}

                {/* 3. RESULTS / STATS */}
                {(project.sections[activeSectionIdx].type === 'Results' || project.sections[activeSectionIdx].type === 'Stats') && (
                  <div className="space-y-4">
                    <p className="text-textSecondary text-[11px]">
                      Configure 3 highlight metrics or statistics displayed in a modern 3-column card grid.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3 bg-[#0B1120] rounded-xl border border-white/5 space-y-2">
                        <span className="text-amber-400 font-bold text-xs">Metric 01</span>
                        <input
                          type="text"
                          value={project.sections[activeSectionIdx].content?.metric1 || ''}
                          onChange={(e) => handleSectionFieldChange('metric1', e.target.value)}
                          placeholder="e.g. 2 Highlight Reels"
                          className="w-full px-2.5 py-1.5 bg-surface/50 border border-white/10 rounded-lg text-textPrimary text-xs focus:outline-none"
                        />

                      </div>
                      <div className="p-3 bg-[#0B1120] rounded-xl border border-white/5 space-y-2">
                        <span className="text-amber-400 font-bold text-xs">Metric 02</span>
                        <input
                          type="text"
                          value={project.sections[activeSectionIdx].content?.metric2 || ''}
                          onChange={(e) => handleSectionFieldChange('metric2', e.target.value)}
                          placeholder="e.g. Full 4K Photo Coverage"
                          className="w-full px-2.5 py-1.5 bg-surface/50 border border-white/10 rounded-lg text-textPrimary text-xs focus:outline-none"
                        />

                      </div>
                      <div className="p-3 bg-[#0B1120] rounded-xl border border-white/5 space-y-2">
                        <span className="text-amber-400 font-bold text-xs">Metric 03</span>
                        <input
                          type="text"
                          value={project.sections[activeSectionIdx].content?.metric3 || ''}
                          onChange={(e) => handleSectionFieldChange('metric3', e.target.value)}
                          placeholder="e.g. Delivered in 48 Hours"
                          className="w-full px-2.5 py-1.5 bg-surface/50 border border-white/10 rounded-lg text-textPrimary text-xs focus:outline-none"
                        />

                      </div>
                    </div>
                  </div>
                )}

                {/* 4. VIDEO */}
                {project.sections[activeSectionIdx].type === 'Video' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Video URL</label>
                        <input
                          type="url"
                          value={project.sections[activeSectionIdx].content?.url || ''}
                          onChange={(e) => handleSectionFieldChange('url', e.target.value)}
                          placeholder="YouTube, Google Drive, or direct video URL"
                          className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary focus:outline-none"
                        />
                        {(() => { const parsed = parseVideoSource(project.sections[activeSectionIdx].content?.url); return project.sections[activeSectionIdx].content?.url ? <p className={`mt-1 text-[10px] ${parsed.error ? 'text-amber-400' : 'text-emerald-400'}`}>{parsed.error ? `⚠ ${parsed.error}` : `✓ ${parsed.provider === 'google-drive' ? 'Google Drive' : parsed.provider === 'youtube' ? 'YouTube' : 'Direct video'} detected`}</p> : null })()}
                      </div>
                      <div>
                        <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Aspect Ratio</label>
                        <select
                          value={project.sections[activeSectionIdx].content?.aspectRatio || '16/9'}
                          onChange={(e) => handleSectionFieldChange('aspectRatio', e.target.value)}
                          className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary focus:outline-none"
                        >
                          <option value="16/9">16:9 (Landscape)</option>
                          <option value="9/16">9:16 (Vertical Reel)</option>
                          <option value="4/3">4:3 (Standard)</option>
                          <option value="1/1">1:1 (Square)</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-[11px] text-textSecondary">
                      <label className="flex items-center gap-2"><input type="checkbox" checked={project.sections[activeSectionIdx].settings?.autoplay === true} onChange={event => handleSectionSettingsChange('autoplay', event.target.checked)} />Autoplay</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={project.sections[activeSectionIdx].settings?.muted === true} onChange={event => handleSectionSettingsChange('muted', event.target.checked)} />Muted</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={project.sections[activeSectionIdx].settings?.loop === true} onChange={event => handleSectionSettingsChange('loop', event.target.checked)} />Loop</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={project.sections[activeSectionIdx].settings?.controls !== false} onChange={event => handleSectionSettingsChange('controls', event.target.checked)} />Controls</label>
                    </div>
                    {parseVideoSource(project.sections[activeSectionIdx].content?.url).provider === 'google-drive' && <p className="text-[10px] text-textSecondary">Google Drive controls and loop behavior are managed by Drive. Ensure the file is shared with “Anyone with the link”.</p>}
                    <div>
                      <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Video Caption</label>
                      <input type="text" value={project.sections[activeSectionIdx].content?.caption || ''} onChange={(e) => handleSectionFieldChange('caption', e.target.value)} className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary focus:outline-none" />

                    </div>

                    {/* Live Video Preview */}
                    {project.sections[activeSectionIdx].content?.url && (
                      <div className="p-3 bg-[#0B1120] rounded-xl border border-white/5 space-y-2">
                        <span className="text-textSecondary text-[10px] uppercase font-bold tracking-wider">Live Video Embed Preview</span>
                        <MediaVideo source={project.sections[activeSectionIdx].content.url} title="Video preview" aspectRatio={project.sections[activeSectionIdx].content?.aspectRatio || '16/9'} autoplay={project.sections[activeSectionIdx].settings?.autoplay === true} muted={project.sections[activeSectionIdx].settings?.muted === true} loop={project.sections[activeSectionIdx].settings?.loop === true} controls={project.sections[activeSectionIdx].settings?.controls !== false} />
                      </div>
                    )}
                  </div>
                )}

                {project.sections[activeSectionIdx].type === 'Design Embed' && (() => {
                  const section = project.sections[activeSectionIdx]
                  const embedSettings = { ...DEFAULT_DESIGN_EMBED, ...section.settings }
                  const parsed = parseDesignEmbed(section.content?.url)
                  const fieldClass = 'w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary focus:outline-none focus:border-amber-500/60'
                  return <div className="space-y-4">
                    <div>
                      <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Figma / Canva Link</label>
                      <input type="url" value={section.content?.url || ''} onChange={event => handleSectionFieldChange('url', event.target.value)} placeholder="Paste Figma or Canva share/embed URL…" className={fieldClass} />
                      {section.content?.url && <p className={`mt-1 text-[10px] ${parsed.error ? 'text-amber-400' : 'text-emerald-400'}`}>{parsed.error ? `⚠ ${parsed.error}` : `✓ ${parsed.provider === 'figma' ? 'Figma' : 'Canva'} detected`}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                      <label className="text-[9px] uppercase text-textSecondary">Container<select value={embedSettings.containerWidth} onChange={event => handleSectionSettingsChange('containerWidth', event.target.value)} className={`${fieldClass} mt-1`}><option value="content">Content</option><option value="wide">Wide</option><option value="fullBleed">Full Bleed</option><option value="custom">Custom</option></select></label>
                      <label className="text-[9px] uppercase text-textSecondary">Desktop height<input type="number" min="200" max="2000" value={embedSettings.heightDesktop} onChange={event => handleSectionSettingsChange('heightDesktop', Number(event.target.value))} className={`${fieldClass} mt-1`} /></label>
                      <label className="text-[9px] uppercase text-textSecondary">Aspect ratio<select value={embedSettings.aspectRatio} onChange={event => handleSectionSettingsChange('aspectRatio', event.target.value)} className={`${fieldClass} mt-1`}><option value="auto">Auto</option><option value="16:9">16:9</option><option value="4:3">4:3</option><option value="1:1">1:1</option><option value="custom">Custom</option></select></label>
                      <label className="text-[9px] uppercase text-textSecondary">Alignment<select value={embedSettings.alignment} onChange={event => handleSectionSettingsChange('alignment', event.target.value)} className={`${fieldClass} mt-1`}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
                      <label className="text-[9px] uppercase text-textSecondary">Corner radius<input type="number" min="0" max="100" value={embedSettings.borderRadius} onChange={event => handleSectionSettingsChange('borderRadius', Number(event.target.value))} className={`${fieldClass} mt-1`} /></label>
                    </div>
                    <details className="rounded-xl border border-white/5 bg-[#0B1120]/50 p-3"><summary className="cursor-pointer text-[10px] font-semibold uppercase text-textSecondary">More / Advanced</summary><div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-6">
                      <label className="text-[9px] text-textSecondary">Tablet height<input type="number" min="200" max="2000" value={embedSettings.heightTablet} onChange={event => handleSectionSettingsChange('heightTablet', Number(event.target.value))} className={`${fieldClass} mt-1`} /></label>
                      <label className="text-[9px] text-textSecondary">Mobile height<input type="number" min="200" max="2000" value={embedSettings.heightMobile} onChange={event => handleSectionSettingsChange('heightMobile', Number(event.target.value))} className={`${fieldClass} mt-1`} /></label>
                      {embedSettings.containerWidth === 'custom' && <label className="text-[9px] text-textSecondary">Custom width<input type="number" min="320" max="2400" value={embedSettings.customWidth} onChange={event => handleSectionSettingsChange('customWidth', Number(event.target.value))} className={`${fieldClass} mt-1`} /></label>}
                      {embedSettings.aspectRatio === 'custom' && <label className="text-[9px] text-textSecondary">Custom ratio<input value={embedSettings.customAspectRatio} onChange={event => handleSectionSettingsChange('customAspectRatio', event.target.value)} placeholder="5 / 4" className={`${fieldClass} mt-1`} /></label>}
                      <label className="text-[9px] text-textSecondary">Background<select value={embedSettings.background} onChange={event => handleSectionSettingsChange('background', event.target.value)} className={`${fieldClass} mt-1`}><option value="transparent">Transparent</option><option value="dark">Dark</option><option value="light">Light</option></select></label>
                      <label className="text-[9px] text-textSecondary">Side padding<input type="number" min="0" max="200" value={embedSettings.sidePadding} onChange={event => handleSectionSettingsChange('sidePadding', Number(event.target.value))} className={`${fieldClass} mt-1`} /></label>
                      <label className="text-[9px] text-textSecondary">Top spacing<input type="number" min="0" max="300" value={embedSettings.paddingTop} onChange={event => handleSectionSettingsChange('paddingTop', Number(event.target.value))} className={`${fieldClass} mt-1`} /></label>
                      <label className="text-[9px] text-textSecondary">Bottom spacing<input type="number" min="0" max="300" value={embedSettings.paddingBottom} onChange={event => handleSectionSettingsChange('paddingBottom', Number(event.target.value))} className={`${fieldClass} mt-1`} /></label>
                    </div></details>
                    {section.content?.url && <div className="rounded-xl border border-white/5 bg-[#0B1120] p-3"><p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-textSecondary">Live design preview</p><DesignEmbedRenderer url={section.content.url} settings={section.settings} title="Design embed preview" /></div>}
                    {parsed.provider === 'figma' && <p className="text-[10px] text-textSecondary">If the design does not appear, check the Figma file’s link-sharing permissions. Password-protected files cannot be embedded.</p>}
                    {parsed.provider === 'canva' && <p className="text-[10px] text-textSecondary">Canva designs must be published through Share → Embed. Normal editor links are not embeddable.</p>}
                  </div>
                })()}

                {/* One media editor for all image collection blocks. */}
                {['Image Section', 'Gallery', 'Album Gallery'].includes(project.sections[activeSectionIdx].type) && <SectionMediaPanel onUploadFont={uploadFont} arrangementHistory={arrangementHistory.current} key={activeSectionId} section={project.sections[activeSectionIdx]} project={project} onUpdate={updater => updateSectionInstance(activeSectionId, updater)} onUploadFile={file => uploadMediaFile(file, token)} />}

                {/* 6. CTA */}
                {project.sections[activeSectionIdx].type === 'CTA' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">CTA Heading</label>
                        <input
                          type="text"
                          value={project.sections[activeSectionIdx].content?.heading || ''}
                          onChange={(e) => handleSectionFieldChange('heading', e.target.value)}
                          className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary focus:outline-none"
                        />

                      </div>
                      <div>
                        <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Button Label</label>
                        <input
                          type="text"
                          value={project.sections[activeSectionIdx].content?.buttonText || ''}
                          onChange={(e) => handleSectionFieldChange('buttonText', e.target.value)}
                          className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary focus:outline-none"
                        />

                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Description / Subtitle</label>
                        <input
                          type="text"
                          value={project.sections[activeSectionIdx].content?.description || ''}
                          onChange={(e) => handleSectionFieldChange('description', e.target.value)}
                          className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary focus:outline-none"
                        />

                      </div>
                      <div>
                        <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Button Link</label>
                        <input
                          type="text"
                          value={project.sections[activeSectionIdx].content?.link || ''}
                          onChange={(e) => handleSectionFieldChange('link', e.target.value)}
                          className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. TESTIMONIAL */}
                {project.sections[activeSectionIdx].type === 'Testimonial' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Client Review / Quote</label>
                      <textarea
                        rows="4"
                        value={project.sections[activeSectionIdx].content?.quote || ''}
                        onChange={(e) => handleSectionFieldChange('quote', e.target.value)}
                        placeholder="e.g. Working with Ekdrishti was an absolute dream..."
                        className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary focus:outline-none"
                      />

                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Client Name / Author</label>
                        <input
                          type="text"
                          value={project.sections[activeSectionIdx].content?.author || ''}
                          onChange={(e) => handleSectionFieldChange('author', e.target.value)}
                          className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary focus:outline-none"
                        />

                      </div>
                      <div>
                        <label className="block text-textSecondary font-semibold mb-1 uppercase tracking-wide">Role / Event Title</label>
                        <input
                          type="text"
                          value={project.sections[activeSectionIdx].content?.role || ''}
                          onChange={(e) => handleSectionFieldChange('role', e.target.value)}
                          className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary focus:outline-none"
                        />

                      </div>
                    </div>
                  </div>
                )}

                {/* 9. CLIENT ACCESS */}
                {['Client Access', 'Downloads'].includes(project.sections[activeSectionIdx].type) && <ClientAccessPanel key={activeSectionId} section={project.sections[activeSectionIdx]} project={project} onUpdate={updater => updateSectionInstance(activeSectionId, updater)} onUploadFont={uploadFont} />}

              </div>
              {project.sections[activeSectionIdx].type !== 'Hero' && <SectionTypographyPanel key={`typography-${activeSectionId}`} section={project.sections[activeSectionIdx]} project={project} onUpdate={updater => updateSectionInstance(activeSectionId, updater)} onUploadFont={uploadFont} />}
              {!['Hero', 'Image Section', 'Gallery', 'Album Gallery', 'Client Access', 'Downloads'].includes(project.sections[activeSectionIdx].type) && <details open className="rounded-xl border border-white/10 p-3"><summary className="text-xs font-semibold text-white">Live section preview</summary><SectionRenderer section={project.sections[activeSectionIdx]} project={project} /></details>}
            </div>
          ) : activeTab === 'metadata' ? (
            <div className="space-y-6">
              <ProjectTypographyPanel project={project} onUploadFont={uploadFont} onChange={(role, changes) => setProject(previous => { const typography = { ...previous.typography }; if (changes === null) delete typography[role]; else { typography[role] = { ...typography[role], ...changes }; for (const key of Object.keys(typography[role])) if (typography[role][key] === '') delete typography[role][key] } return { ...previous, typography } })} />
              <div className="border-b border-white/5 pb-4">
                <h2 className="text-sm font-heading font-bold text-white uppercase tracking-wider">SEO Engine Analysis</h2>
                <p className="text-textSecondary text-[10px]">Realtime checklist tracking title optimization, metadata length, and crawling parameters</p>
              </div>

              {(() => {
                const { score, checks } = getSEOHealth()
                return (
                  <div className="space-y-6">
                    {/* Circle Score Wrapper */}
                    <div className="flex items-center gap-6 bg-[#0B1120] border border-white/5 p-6 rounded-2xl">
                      <div className="relative w-16 h-16 flex items-center justify-center rounded-full border-4 border-[#0F172A]">
                        <span className={`text-base font-heading font-black ${score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'
                          }`}>
                          {score}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white">Overall SEO Health Score</p>
                        <p className="text-[10px] text-textSecondary leading-relaxed">
                          {score >= 80
                            ? 'Excellent parameters configuration! Page ready to index.'
                            : score >= 50
                              ? 'Moderate. Resolve remaining issues to boost search visibility.'
                              : 'Sub-optimal configuration. Input metadata details to allow search discoverability.'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Checklist list */}
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">Optimizations Audit</h3>
                      <div className="space-y-2.5">
                        {checks.map((c, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-[10px] bg-[#0B1120]/40 p-2.5 rounded-xl border border-white/5">
                            <span className="text-xs leading-none">
                              {c.ok ? '✅' : '⚠️'}
                            </span>
                            <span className={c.ok ? 'text-textPrimary' : 'text-amber-400 font-semibold'}>
                              {c.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[300px] text-textSecondary text-xs">
              Select a block to edit its configuration fields.
            </div>
          )}
        </div>
      </div>

      {/* ADD SECTION POPUP */}
      {showAddSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0F172A] border border-white/10 p-6 rounded-2xl shadow-2xl relative space-y-4">
            <h2 className="text-lg font-heading font-bold text-white">Add Page Block</h2>
            <div className="text-xs space-y-3">
              <label className="block text-textSecondary font-semibold uppercase tracking-wide">Select Block Type</label>
              <select
                value={newSectionType}
                onChange={(e) => setNewSectionType(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary focus:outline-none focus:border-amber-500/60 font-semibold"
              >
                <option value="Hero">🖼️ Hero Showcase (Masonry Grid)</option>
                <option value="Rich Text">📝 Rich Text & Story</option>
                <option value="Results">📊 Key Results & Metrics</option>
                <option value="Image Section">📸 Image Section</option>
                <option value="Video">🎬 Video Player / YouTube</option>
                <option value="Design Embed">🎨 Design Embed (Figma / Canva)</option>
                <option value="CTA">⚡ Call to Action (CTA)</option>
                <option value="Testimonial">💬 Client Testimonial</option>
                <option value="Client Access">🔒 Client Downloads</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-3 text-xs border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowAddSection(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-textPrimary font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddSection}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-primary font-bold transition-all shadow"
              >
                Insert Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALBUM PICKER MODAL */}
      {showAlbumPicker && (() => {
        const isHeroPicker = albumPickerTarget === 'hero'
        const isHeroSlides = albumPickerTarget === 'heroSlides'
        const activeGalleryList = isHeroPicker
          ? []
          : (project.sections && activeSectionIdx !== null ? (project.sections[activeSectionIdx]?.content?.images || []) : [])
        const activeGalleryUrls = activeGalleryList.map(item => typeof item === 'string' ? item : (item?.src || item?.url || ''))
        const isUnifiedImageSection = project.sections?.[activeSectionIdx]?.type === 'Image Section' || isHeroSlides

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-3xl bg-[#0F172A] border border-white/10 p-6 rounded-2xl shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <h2 className="text-base font-heading font-bold text-white">
                    {isHeroPicker || isHeroSlides ? 'Pick Hero Images from Album' : 'Pick Image Section Media from Album'}
                  </h2>
                  <p className="text-textSecondary text-[11px]">
                    {isHeroPicker || isHeroSlides
                      ? 'Click photos to toggle them into this Hero media set (min 1, max 20).'
                      : 'Click photos to toggle them into this Image Section.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${isHeroPicker
                      ? ((project?.hero?.length || 0) >= 1 && (project?.hero?.length || 0) <= 20
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400')
                      : 'bg-amber-500/20 text-amber-400'
                    }`}>
                    {isHeroPicker
                      ? `${project?.hero?.length || 0} / 20 Selected`
                      : `${activeGalleryList.length} Selected`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAlbumPicker(false)}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-primary font-bold rounded-xl text-xs transition-all shadow"
                  >
                    Done
                  </button>
                </div>
              </div>

              {/* Aspect Ratio Filter Bar & Quick Selectors */}
              <div className="space-y-2 border-b border-white/5 pb-3">
                {/* Ratio Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
                  <span className="text-textSecondary/80 font-bold uppercase tracking-wider text-[9px] mr-1">Ratio Filter:</span>
                  {['ALL', '3:4', '4:3', '3:2', '2:3', '16:9', '9:16', '1:1'].map((ratioKey) => (
                    <button
                      key={ratioKey}
                      type="button"
                      onClick={() => setAlbumRatioFilter(ratioKey)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${albumRatioFilter === ratioKey
                          ? 'bg-amber-500 text-primary shadow'
                          : 'bg-white/5 text-textSecondary hover:text-white hover:bg-white/10'
                        }`}
                    >
                      {ratioKey === 'ALL' ? 'All Photos' : ratioKey}
                    </button>
                  ))}
                </div>

                {/* Quick selectors bar */}
                <div className="flex items-center justify-between gap-2 text-xs pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const album = project?.album || []
                        if (isHeroPicker) {
                          setIsDirty(true)
                          setProject(prev => ({ ...prev, hero: album.slice(0, 5) }))
                        } else {
                          handleSectionFieldChange('images', album.slice(0, 5))
                        }
                      }}
                      className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] text-textSecondary hover:text-white"
                    >
                      Select First 5
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const album = project?.album || []
                        if (isHeroPicker) {
                          setIsDirty(true)
                          setProject(prev => ({ ...prev, hero: album.slice(0, 10) }))
                        } else {
                          handleSectionFieldChange('images', album.slice(0, 10))
                        }
                      }}
                      className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] text-textSecondary hover:text-white"
                    >
                      Select First 10
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const album = project?.album || []
                        if (isHeroPicker) {
                          setIsDirty(true)
                          setProject(prev => ({ ...prev, hero: album.slice(0, 20) }))
                        } else {
                          handleSectionFieldChange('images', album.slice(0, 20))
                        }
                      }}
                      className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] text-textSecondary hover:text-white"
                    >
                      Select First 20
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (isHeroPicker) {
                        setIsDirty(true)
                        setProject(prev => ({ ...prev, hero: [] }))
                      } else {
                        handleSectionFieldChange('images', [])
                      }
                    }}
                    className="text-red-400 hover:underline text-[10px]"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>

              {/* Photos Grid */}
              <div className="flex-1 overflow-y-auto pr-1">
                {(!project?.album || project.album.length === 0) ? (
                  <div className="py-16 text-center text-textSecondary text-xs">
                    This project has no album photos yet. Add album photos in the Metadata tab first.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-1">
                    {project.album
                      .filter((src) => {
                        if (albumRatioFilter === 'ALL') return true
                        const ratio = imageRatios[src]
                        return ratio ? ratio.key === albumRatioFilter : true
                      })
                      .map((src, idx) => {
                        const isSelected = isHeroPicker
                          ? (project?.hero || []).includes(src)
                          : activeGalleryUrls.includes(src)
                        const itemIdx = isHeroPicker
                          ? (project?.hero || []).indexOf(src)
                          : activeGalleryUrls.indexOf(src)
                        const ratioInfo = imageRatios[src]

                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              if (isHeroPicker) {
                                setIsDirty(true)
                                setProject(prev => {
                                  const list = prev.hero ? [...prev.hero] : []
                                  if (isSelected) {
                                    return { ...prev, hero: list.filter(item => item !== src) }
                                  } else {
                                    if (list.length >= 20) {
                                      alert('Maximum 20 hero images reached.')
                                      return prev
                                    }
                                    return { ...prev, hero: [...list, src] }
                                  }
                                })
                              } else {
                                if (isSelected) {
                                  const updated = activeGalleryList.filter(item => (typeof item === 'string' ? item : (item?.src || item?.url)) !== src)
                                  handleSectionFieldChange('images', updated)
                                } else {
                                  handleSectionFieldChange('images', [...activeGalleryList, isUnifiedImageSection ? { id: createBlockId('media'), src, alt: '', focalX: 50, focalY: 50 } : src])
                                }
                              }
                            }}
                            className={`group relative rounded-xl overflow-hidden aspect-square cursor-pointer transition-all duration-200 border ${isSelected
                                ? 'border-amber-400 ring-2 ring-amber-400/50 scale-[0.98]'
                                : 'border-white/10 hover:border-white/40'
                              }`}
                          >
                            {/* Thumbnail Image */}
                            <img
                              src={src}
                              alt="album"
                              onLoad={(e) => {
                                const { naturalWidth, naturalHeight } = e.target
                                if (naturalWidth && naturalHeight && !imageRatios[src]) {
                                  const detected = detectClosestRatio(naturalWidth, naturalHeight)
                                  setImageRatios(prev => ({ ...prev, [src]: detected }))
                                }
                              }}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />

                            {/* Aspect Ratio Tag Badge (Top Left) */}
                            {ratioInfo && (
                              <span className="absolute top-1.5 left-1.5 z-10 bg-black/80 backdrop-blur text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10 shadow">
                                {ratioInfo.badge}
                              </span>
                            )}

                            {/* Selected Indicator */}
                            {isSelected ? (
                              <div className="absolute inset-0 bg-amber-500/20 backdrop-blur-[1px] flex flex-col justify-between p-2">
                                <span className="self-end bg-amber-500 text-black font-bold text-[10px] px-2 py-0.5 rounded-full shadow">
                                  #{itemIdx + 1}
                                </span>
                                <span className="self-center bg-black/80 text-amber-300 font-bold text-[10px] px-2 py-1 rounded-lg">
                                  {isHeroPicker ? '✓ In Hero' : '✓ In Gallery'}
                                </span>
                              </div>
                            ) : (
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                                  {isHeroPicker ? '＋ Add to Hero' : '＋ Add to Gallery'}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-white/5 flex justify-between items-center text-xs">
                <span className="text-textSecondary text-[11px]">
                  Images selected: <strong className="text-white">
                    {isHeroPicker ? (project?.hero?.length || 0) : activeGalleryList.length}
                  </strong> {isHeroPicker ? '(limit 20)' : ''}
                </span>
                <button
                  type="button"
                  onClick={() => setShowAlbumPicker(false)}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-primary font-bold rounded-xl transition-all"
                >
                  Save & View Layout
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* BULK PHOTO IMPORTER MODAL (GOOGLE DRIVE & LOCAL BATCH DROPZONE) */}
      <BulkPhotoImporterModal
        isOpen={showBulkImporter}
        onClose={() => setShowBulkImporter(false)}
        token={token}
        defaultTarget={bulkImporterTarget}
        maxHeroLimit={20}
        onImportComplete={handleBulkImportComplete}
      />
    </div>
  )
}
