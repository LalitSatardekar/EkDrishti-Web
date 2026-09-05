import CachedImage from '../ui/CachedImage'

const AlbumCard = ({ image, onClick }) => {
  return (
    <div
      className="relative cursor-pointer break-inside-avoid mb-3 group"
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-[4px] shadow-lg transition-transform duration-500 ease-out group-hover:scale-[1.02]">
        <CachedImage
          src={image.src}
          alt={image.alt || image.title || 'Album image'}
          className="w-full h-auto block"
          containerClassName="rounded-[4px]"
        />

        {/* Hover zoom overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
          <div className="w-9 h-9 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlbumCard
