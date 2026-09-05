import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useCases } from '../../context/CasesContext'

export default function AdminMedia() {
  const { token } = useAuth()
  const { allCases } = useCases()
  const [localHistory, setLocalHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('ekdrishti_uploaded_media')
      return saved ? JSON.parse(saved) : []
    } catch (_) {
      return []
    }
  })
  
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [copiedIndex, setCopiedIndex] = useState(null)

  // Aggregate S3/local images from the database case studies album
  const aggregatedImages = () => {
    const list = []
    
    // Add cover images
    allCases.forEach(c => {
      if (c.image) list.push({ url: c.image, source: c.title, type: 'Cover Image' })
      if (c.thumbnail169) list.push({ url: c.thumbnail169, source: c.title, type: 'Thumbnail (16:9)' })
      if (c.thumbnail32) list.push({ url: c.thumbnail32, source: c.title, type: 'Thumbnail (3:2)' })
      
      if (c.album && Array.isArray(c.album)) {
        c.album.forEach(img => {
          list.push({ url: img, source: c.title, type: 'Album Photo' })
        })
      }

      if (c.sections && Array.isArray(c.sections)) {
        c.sections.forEach(sec => {
          if (sec.type === 'Gallery' && sec.content?.images) {
            sec.content.images.forEach(img => {
              list.push({ url: img, source: `${c.title} -> Gallery`, type: 'Gallery Block' })
            })
          }
        })
      }
    })

    // Add local uploaded history (deduplicating URLs)
    const urls = new Set(list.map(item => item.url))
    localHistory.forEach(item => {
      if (!urls.has(item.url)) {
        list.push({ url: item.url, source: 'Uploaded via Media Library', type: 'Direct Upload' })
      }
    })

    return list
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const base64 = event.target.result
        const res = await fetch('/v1/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            filename: file.name,
            fileType: file.type,
            content: base64
          })
        })

        const data = await res.json()
        if (data.success) {
          const entry = {
            url: data.data.webpUrl,
            filename: data.data.filename,
            uploaded_at: new Date().toISOString()
          }
          const updated = [entry, ...localHistory]
          setLocalHistory(updated)
          localStorage.setItem('ekdrishti_uploaded_media', JSON.stringify(updated))
        } else {
          throw new Error(data.message || 'Upload failed')
        }
      } catch (err) {
        alert(`Media Upload error: ${err.message}`)
      } finally {
        setUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleCopyLink = (url, idx) => {
    navigator.clipboard.writeText(url)
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const allImages = aggregatedImages()
  const filteredImages = allImages.filter(item => 
    item.url.toLowerCase().includes(search.toLowerCase()) || 
    item.source.toLowerCase().includes(search.toLowerCase()) ||
    item.type.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-black text-white">Media Library</h1>
          <p className="text-textSecondary text-xs">Browse all website graphics, compress WebP assets, and copy absolute URLs</p>
        </div>
        <label className="bg-amber-500 hover:bg-amber-400 text-primary font-bold py-2.5 px-5 rounded-xl transition-all text-xs cursor-pointer flex items-center gap-2">
          {uploading ? 'Uploading...' : '＋ Upload Image'}
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* FILTER / SEARCH */}
      <div>
        <input
          type="text"
          placeholder="Search media by URL, source name, or image type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 bg-[#0F172A]/40 border border-white/5 rounded-xl text-textPrimary placeholder-textSecondary/30 focus:outline-none focus:border-amber-500/60 text-xs"
        />
      </div>

      {/* MEDIA GRID */}
      {filteredImages.length === 0 ? (
        <div className="bg-[#0F172A]/40 border border-white/5 p-20 rounded-2xl text-center text-xs text-textSecondary">
          {search ? 'No files match your query.' : 'Media Library is empty. Upload your first picture!'}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredImages.map((img, idx) => (
            <div key={idx} className="bg-[#0F172A]/40 border border-white/5 p-3 rounded-2xl flex flex-col justify-between space-y-3 hover:border-white/10 transition-all group">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-[#0B1120] border border-white/5 flex items-center justify-center">
                <img src={img.url} alt="media" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <span className="absolute bottom-2 left-2 text-[8px] font-bold bg-black/60 text-amber-400 px-1.5 py-0.5 rounded uppercase">
                  {img.type}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-white truncate">{img.url.substring(img.url.lastIndexOf('/') + 1)}</p>
                <p className="text-[9px] text-textSecondary truncate">Src: {img.source}</p>
              </div>
              <button
                onClick={() => handleCopyLink(img.url, idx)}
                className={`w-full py-1 text-[10px] font-semibold rounded-lg border transition-all ${
                  copiedIndex === idx
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-white/5 text-textSecondary hover:text-white border-transparent hover:border-white/10'
                }`}
              >
                {copiedIndex === idx ? 'Copied URL!' : '🔗 Copy Path'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
