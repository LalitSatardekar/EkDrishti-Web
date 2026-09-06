import { useState, useRef } from 'react'

export default function BulkPhotoImporterModal({
  isOpen,
  onClose,
  token,
  onImportComplete,
  defaultTarget = 'album', // 'album' | 'hero' | 'both' | 'media'
  maxHeroLimit = 20
}) {
  const [activeTab, setActiveTab] = useState('drive') // 'drive' | 'local'
  const [targetDest, setTargetDest] = useState(defaultTarget)
  
  // Google Drive state
  const [driveInput, setDriveInput] = useState('')
  const [driveApiKey, setDriveApiKey] = useState('')
  const [driveMaxFiles, setDriveMaxFiles] = useState(30)
  const [showDriveAdvanced, setShowDriveAdvanced] = useState(false)
  const [driveLoading, setDriveLoading] = useState(false)
  const [driveStatus, setDriveStatus] = useState('')
  const [driveError, setDriveError] = useState('')

  // Local Batch Upload state
  const [stagedFiles, setStagedFiles] = useState([])
  const [batchUploading, setBatchUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, percent: 0, currentName: '' })
  const [batchError, setBatchError] = useState('')

  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)

  if (!isOpen) return null

  // -------------------------------------------------------------
  // GOOGLE DRIVE IMPORT HANDLER
  // -------------------------------------------------------------
  const handleDriveImport = async () => {
    if (!driveInput.trim()) {
      setDriveError('Please paste a Google Drive folder link or photo URLs.')
      return
    }

    setDriveLoading(true)
    setDriveError('')
    setDriveStatus('Connecting to Google Drive & scanning images...')

    try {
      const res = await fetch('/v1/gdrive-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          input: driveInput.trim(),
          apiKey: driveApiKey.trim() || undefined,
          maxFiles: Number(driveMaxFiles) || 30
        })
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Google Drive import failed')
      }

      setDriveStatus(`✓ Successfully imported & converted ${data.count} photos to WebP!`)
      
      const newUrls = (data.data || []).map(item => item.webpUrl)
      if (onImportComplete) {
        onImportComplete(newUrls, targetDest)
      }

      setTimeout(() => {
        setDriveLoading(false)
        onClose()
      }, 1500)
    } catch (err) {
      setDriveError(err.message || 'Failed to import from Google Drive')
      setDriveLoading(false)
      setDriveStatus('')
    }
  }

  // -------------------------------------------------------------
  // LOCAL MULTI-FILE & FOLDER HANDLERS
  // -------------------------------------------------------------
  const handleFilesSelected = (fileList) => {
    setBatchError('')
    const validFiles = Array.from(fileList).filter(file => {
      const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(file.name)
      if (!isImage) return false
      if (file.size > 30 * 1024 * 1024) {
        setBatchError(`Skipped "${file.name}": exceeds 30MB maximum limit.`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) {
      setBatchError('No valid image files under 30MB found in selection.')
      return
    }

    // Generate quick object previews
    const newStaged = validFiles.map(file => ({
      file,
      name: file.name,
      sizeKb: (file.size / 1024).toFixed(0),
      previewUrl: URL.createObjectURL(file)
    }))

    setStagedFiles(prev => [...prev, ...newStaged])
  }

  const handleRemoveStaged = (index) => {
    setStagedFiles(prev => {
      const updated = [...prev]
      if (updated[index]?.previewUrl) {
        URL.revokeObjectURL(updated[index].previewUrl)
      }
      updated.splice(index, 1)
      return updated
    })
  }

  const handleClearStaged = () => {
    stagedFiles.forEach(item => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
    })
    setStagedFiles([])
  }

  const handleBatchUpload = async () => {
    if (stagedFiles.length === 0) return

    setBatchUploading(true)
    setBatchError('')
    const total = stagedFiles.length
    const uploadedUrls = []
    const failedFiles = []

    setUploadProgress({ current: 0, total, percent: 0, currentName: '' })

    // Helper: upload single file via base64
    const uploadSingleFile = (fileItem) => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            const base64 = e.target.result
            const res = await fetch('/v1/upload', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                filename: fileItem.name,
                fileType: fileItem.file.type || 'image/jpeg',
                content: base64
              })
            })

            const data = await res.json()
            if (res.ok && data.success && data.data?.webpUrl) {
              resolve({ success: true, url: data.data.webpUrl })
            } else {
              resolve({ success: false, error: data.message || 'Upload error' })
            }
          } catch (err) {
            resolve({ success: false, error: err.message })
          }
        }
        reader.onerror = () => resolve({ success: false, error: 'File read error' })
        reader.readAsDataURL(fileItem.file)
      })
    }

    // Process in batches of 3 concurrent requests
    const CONCURRENCY = 3
    for (let i = 0; i < total; i += CONCURRENCY) {
      const chunk = stagedFiles.slice(i, i + CONCURRENCY)
      const results = await Promise.all(chunk.map(uploadSingleFile))

      results.forEach((res, idx) => {
        const item = chunk[idx]
        if (res.success) {
          uploadedUrls.push(res.url)
        } else {
          failedFiles.push(`${item.name} (${res.error})`)
        }
      })

      const processedCount = Math.min(i + CONCURRENCY, total)
      const pct = Math.round((processedCount / total) * 100)
      setUploadProgress({
        current: processedCount,
        total,
        percent: pct,
        currentName: chunk[chunk.length - 1]?.name || ''
      })
    }

    if (failedFiles.length > 0) {
      setBatchError(`Warning: ${failedFiles.length} files failed to upload.`)
    }

    if (uploadedUrls.length > 0) {
      if (onImportComplete) {
        onImportComplete(uploadedUrls, targetDest)
      }
      setTimeout(() => {
        setBatchUploading(false)
        handleClearStaged()
        onClose()
      }, 1200)
    } else {
      setBatchUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0B1120]/60">
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-amber-400">Bulk Photo Importer</div>
            <h2 className="text-lg font-heading font-black text-white">Import Photos (Drive & Batch Drop)</h2>
          </div>
          <button
            onClick={onClose}
            disabled={driveLoading || batchUploading}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-textSecondary hover:text-white flex items-center justify-center transition-all disabled:opacity-50 text-sm"
          >
            ✕
          </button>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex border-b border-white/5 bg-[#0B1120]/40 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('drive')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'drive'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-textSecondary hover:text-white'
            }`}
          >
            <span>🌐</span> Google Drive (Folder or Multi-Photo)
          </button>
          <button
            onClick={() => setActiveTab('local')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'local'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-textSecondary hover:text-white'
            }`}
          >
            <span>📁</span> Batch Files & Local Folder
          </button>
        </div>

        {/* TARGET DESTINATION SELECTOR */}
        {defaultTarget !== 'media' && (
          <div className="px-6 py-3 bg-[#0B1120]/30 border-b border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-textSecondary font-semibold">Where to add imported photos:</span>
            <div className="flex items-center gap-1 bg-[#0B1120] p-1 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setTargetDest('album')}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  targetDest === 'album'
                    ? 'bg-amber-500 text-primary shadow'
                    : 'text-textSecondary hover:text-white'
                }`}
              >
                📚 Album Gallery
              </button>
              <button
                type="button"
                onClick={() => setTargetDest('hero')}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  targetDest === 'hero'
                    ? 'bg-amber-500 text-primary shadow'
                    : 'text-textSecondary hover:text-white'
                }`}
              >
                📐 Hero Grid (max {maxHeroLimit})
              </button>
              <button
                type="button"
                onClick={() => setTargetDest('both')}
                className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  targetDest === 'both'
                    ? 'bg-amber-500 text-primary shadow'
                    : 'text-textSecondary hover:text-white'
                }`}
              >
                ⚡ Both Album & Hero
              </button>
            </div>
          </div>
        )}

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* ============================================================== */}
          {/* TAB 1: GOOGLE DRIVE IMPORT                                    */}
          {/* ============================================================== */}
          {activeTab === 'drive' && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-300 leading-relaxed">
                💡 <strong>Google Drive Tip:</strong> Ensure your Google Drive folder or files are shared as 
                <span className="underline font-bold ml-1">"Anyone with the link can view"</span>. You can paste a <strong>Folder link</strong> or paste <strong>multiple photo links</strong> separated by newlines.
              </div>

              <div>
                <label className="block text-textSecondary text-xs font-semibold uppercase tracking-wider mb-1.5">
                  Paste Google Drive Folder Link or Multiple Photo URLs
                </label>
                <textarea
                  rows={4}
                  value={driveInput}
                  onChange={(e) => setDriveInput(e.target.value)}
                  placeholder={`https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ\n\nOR multiple links:\nhttps://drive.google.com/file/d/1ABC123/view\nhttps://drive.google.com/file/d/2XYZ456/view`}
                  className="w-full px-4 py-3 bg-[#0B1120] border border-white/10 rounded-xl text-textPrimary placeholder-textSecondary/30 focus:outline-none focus:border-amber-500/60 font-mono text-xs"
                />
              </div>

              {/* Import Limit Settings */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-textSecondary font-medium">Max photos to import:</span>
                <div className="flex items-center gap-2">
                  {[10, 20, 30, 50].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setDriveMaxFiles(num)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        driveMaxFiles === num
                          ? 'bg-white/20 text-amber-400 border border-amber-400/40'
                          : 'bg-white/5 text-textSecondary hover:text-white border border-transparent'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Advanced API Key */}
              <div className="border-t border-white/5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowDriveAdvanced(!showDriveAdvanced)}
                  className="text-[11px] text-textSecondary hover:text-white flex items-center gap-1 font-semibold"
                >
                  <span>{showDriveAdvanced ? '▼' : '▶'}</span> Advanced: Google Drive API Key (Optional)
                </button>
                {showDriveAdvanced && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={driveApiKey}
                      onChange={(e) => setDriveApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-lg text-textPrimary placeholder-textSecondary/30 focus:outline-none text-xs font-mono"
                    />
                    <p className="text-[10px] text-textSecondary mt-1">
                      Optional: only needed if you want direct API quota folder indexing.
                    </p>
                  </div>
                )}
              </div>

              {/* Status / Error feedback */}
              {driveStatus && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-medium flex items-center gap-2">
                  <span>🚀</span> {driveStatus}
                </div>
              )}
              {driveError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium">
                  ⚠️ {driveError}
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={handleDriveImport}
                disabled={driveLoading || !driveInput.trim()}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-primary font-bold rounded-xl transition-all shadow-lg shadow-amber-500/10 text-xs disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {driveLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                    <span>Importing & Converting to WebP...</span>
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    <span>Import & Optimize from Google Drive</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: LOCAL BATCH DROPZONE & FOLDER UPLOAD                   */}
          {/* ============================================================== */}
          {activeTab === 'local' && (
            <div className="space-y-4">
              
              {/* Drag and drop box */}
              <div
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleFilesSelected(e.dataTransfer.files)
                  }
                }}
                className="border-2 border-dashed border-white/10 hover:border-amber-400/50 rounded-2xl p-6 text-center bg-[#0B1120]/60 transition-all cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📥</div>
                <div className="text-sm font-bold text-white mb-1">
                  Drag & Drop Multiple Photos Here
                </div>
                <div className="text-xs text-textSecondary mb-4">
                  Supports JPEG, PNG, WEBP, GIF up to 30MB each
                </div>

                <div className="flex items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
                  {/* Select Multiple Files */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-primary font-bold text-xs rounded-xl transition-all shadow"
                  >
                    📁 Select Multiple Photos
                  </button>

                  {/* Select Entire Folder */}
                  <button
                    type="button"
                    onClick={() => folderInputRef.current?.click()}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs rounded-xl transition-all"
                  >
                    📂 Select Local Folder
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFilesSelected(e.target.files)}
                    className="hidden"
                  />
                  <input
                    ref={folderInputRef}
                    type="file"
                    webkitdirectory=""
                    directory=""
                    onChange={(e) => handleFilesSelected(e.target.files)}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Staged files tray */}
              {stagedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">
                      Selected Photos ({stagedFiles.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleClearStaged}
                      disabled={batchUploading}
                      className="text-red-400 hover:underline text-[11px]"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 bg-[#0B1120] rounded-xl border border-white/5">
                    {stagedFiles.map((item, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group border border-white/5 bg-black/40">
                        <img src={item.previewUrl} alt={item.name} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveStaged(idx)}
                          disabled={batchUploading}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 hover:bg-red-500 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        >
                          ✕
                        </button>
                        <div className="absolute bottom-0 inset-x-0 bg-black/70 px-1 py-0.5 text-[8px] text-white truncate font-mono text-center">
                          {item.sizeKb}KB
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress bar */}
              {batchUploading && (
                <div className="space-y-1.5 p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex justify-between text-xs font-semibold text-textSecondary">
                    <span>Uploading & Optimizing ({uploadProgress.current}/{uploadProgress.total})...</span>
                    <span className="text-amber-400">{uploadProgress.percent}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full transition-all duration-200"
                      style={{ width: `${uploadProgress.percent}%` }}
                    />
                  </div>
                  {uploadProgress.currentName && (
                    <div className="text-[10px] text-textSecondary truncate font-mono">
                      Current: {uploadProgress.currentName}
                    </div>
                  )}
                </div>
              )}

              {batchError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                  ⚠️ {batchError}
                </div>
              )}

              {/* Upload Trigger */}
              {stagedFiles.length > 0 && (
                <button
                  type="button"
                  onClick={handleBatchUpload}
                  disabled={batchUploading}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-primary font-bold rounded-xl transition-all shadow-lg shadow-amber-500/10 text-xs disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {batchUploading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                      <span>Uploading Batch ({uploadProgress.current}/{uploadProgress.total})...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>Upload & Optimize All {stagedFiles.length} Photos</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
