import AlbumCard from './AlbumCard'

const AlbumGrid = ({ images, onImageClick }) => {
  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-3">
      {images.map((image, index) => (
        <AlbumCard
          key={image.id || index}
          image={image}
          onClick={() => onImageClick && onImageClick(index)}
        />
      ))}
    </div>
  )
}

export default AlbumGrid
