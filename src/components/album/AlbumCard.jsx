const AlbumCard = ({ image, onClick }) => {
  return (
    <div
      className="relative cursor-pointer break-inside-avoid mb-3"
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-[4px] shadow-lg transition-transform duration-500 ease-out hover:scale-[1.02]">
        <img
          src={image.src}
          alt={image.alt || image.title || 'Album image'}
          loading="lazy"
          className="w-full h-auto block"
        />
      </div>
    </div>
  )
}

export default AlbumCard
