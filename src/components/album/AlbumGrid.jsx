import AlbumCard from './AlbumCard'

const AlbumGrid = ({ images, onImageClick, layout = { columns: 4, gap: 12 } }) => {
  const columns = Number(layout.columns) || 4
  const rawGap = Number(layout.gap)
  const gap = Number.isFinite(rawGap) ? Math.min(64, Math.max(0, rawGap)) : 12
  return (
    <div className={columns === 2 ? 'columns-1 sm:columns-2' : columns === 3 ? 'columns-1 sm:columns-2 md:columns-3' : columns === 5 ? 'columns-1 sm:columns-2 md:columns-3 lg:columns-5' : 'columns-1 sm:columns-2 md:columns-3 lg:columns-4'} style={{ columnGap: `${gap}px` }}>
      {images.map((image, index) => (
        <AlbumCard
          key={image.id || index}
          image={image}
          gap={`${gap}px`}
          onClick={() => onImageClick && onImageClick(index)}
        />
      ))}
    </div>
  )
}

export default AlbumGrid
