# Liquid Masonry Album Grid - Usage Examples

## Basic Usage

```jsx
import AlbumGrid from './components/album/AlbumGrid'

const myImages = [
  { id: 1, src: '/path/to/image1.jpg', title: 'Image 1', alt: 'Description 1' },
  { id: 2, src: '/path/to/image2.jpg', title: 'Image 2', alt: 'Description 2' },
  { id: 3, src: '/path/to/image3.jpg', title: 'Image 3', alt: 'Description 3' },
]

function MyGallery() {
  const handleImageClick = (index) => {
    console.log('Clicked image at index:', index)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">My Gallery</h1>
      <AlbumGrid images={myImages} onImageClick={handleImageClick} />
    </div>
  )
}
```

## With Lightbox Integration

```jsx
import { useState } from 'react'
import AlbumGrid from './components/album/AlbumGrid'

function GalleryWithLightbox() {
  const [selectedIndex, setSelectedIndex] = useState(null)
  
  const images = [
    { id: 1, src: '/image1.jpg', title: 'Sunset', alt: 'Beautiful sunset' },
    { id: 2, src: '/image2.jpg', title: 'Mountain', alt: 'Mountain view' },
    { id: 3, src: '/image3.jpg', title: 'Ocean', alt: 'Ocean waves' },
  ]

  return (
    <>
      <AlbumGrid 
        images={images} 
        onImageClick={(index) => setSelectedIndex(index)} 
      />
      
      {selectedIndex !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <img 
            src={images[selectedIndex].src} 
            alt={images[selectedIndex].alt}
            className="max-w-[90%] max-h-[90vh]"
          />
          <button 
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 text-white"
          >
            Close
          </button>
        </div>
      )}
    </>
  )
}
```

## Standalone AlbumCard

```jsx
import AlbumCard from './components/album/AlbumCard'

function SingleCard() {
  const image = {
    id: 1,
    src: '/my-photo.jpg',
    title: 'My Photo',
    alt: 'A beautiful photograph'
  }

  return (
    <div className="max-w-md mx-auto">
      <AlbumCard 
        image={image} 
        onClick={() => console.log('Card clicked')} 
      />
    </div>
  )
}
```

## Data Structure

```typescript
type AlbumImage = {
  id: number
  src: string
  alt?: string
  title?: string
}

type AlbumGridProps = {
  images: AlbumImage[]
  onImageClick?: (index: number) => void
}

type AlbumCardProps = {
  image: AlbumImage
  onClick?: () => void
}
```

## Features

✅ Automatic responsive layout (1/2/3/4 columns)
✅ Images maintain original aspect ratio
✅ No cropping or distortion
✅ Smooth hover effects
✅ Lazy loading enabled
✅ Clean, reusable components
✅ No external dependencies
✅ Production-ready code
