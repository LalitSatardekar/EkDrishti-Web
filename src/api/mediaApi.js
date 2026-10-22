export async function uploadMediaFile(file, token) {
  if (!file || !file.type.startsWith('image/')) throw new Error('Choose an image file.')
  if (file.size > 30 * 1024 * 1024) throw new Error(`${file.name} exceeds the 30MB image limit.`)
  const content = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`))
    reader.readAsDataURL(file)
  })
  const response = await fetch('/v1/upload', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ filename: file.name, fileType: file.type, content }) })
  const result = await response.json()
  if (!response.ok || !result.success) throw new Error(result.message || `Upload failed for ${file.name}.`)
  let dimensions = {}
  if (typeof createImageBitmap === 'function') {
    try { const bitmap = await createImageBitmap(file); dimensions = { width: bitmap.width, height: bitmap.height }; bitmap.close() } catch { /* Renderer can measure the uploaded image. */ }
  }
  return { src: result.data.webpUrl, originalUrl: result.data.originalUrl, ...dimensions }
}
