import { useState, useEffect } from 'react'
import AlbumGrid from '../album/AlbumGrid'

import album1 from '../../assets/siddhita-kanad/albumdata/063fd5d7-ac84-4b6c-82af-7a18f8496ab0_rw_1920.jpg'
import album2 from '../../assets/siddhita-kanad/albumdata/0787542f-505d-44f8-99e7-99f0549f179a_rw_1920.jpg'
import album3 from '../../assets/siddhita-kanad/albumdata/1156ae2f-725d-4574-8709-f64854e41d46_rw_1920.jpg'
import album4 from '../../assets/siddhita-kanad/albumdata/119f3125-7366-4866-a96e-b49100dc8481_rw_1920.jpg'
import album5 from '../../assets/siddhita-kanad/albumdata/12212b2b-b556-43e7-9159-2be9c0f6dfe5_rw_1920.jpg'
import album6 from '../../assets/siddhita-kanad/albumdata/23014c2c-e0be-472d-90c6-3de94f795fb4_rw_1920.jpg'
import album7 from '../../assets/siddhita-kanad/albumdata/26f89827-ff09-44b6-a061-8c5346de155a_rw_1920.jpg'
import album8 from '../../assets/siddhita-kanad/albumdata/33ffae60-822f-47ec-a44b-e062ca6801b1_rw_1920.jpg'
import album9 from '../../assets/siddhita-kanad/albumdata/3b05b371-7806-40f0-a4d3-1db5bbc24b8f_rw_1920.jpg'
import album10 from '../../assets/siddhita-kanad/albumdata/3ccf3ca3-7a80-404d-824f-cba9cecc2d62_rw_1920.jpg'
import album11 from '../../assets/siddhita-kanad/albumdata/4c76c2fc-0629-4978-9121-6fadc4c09287_rw_1920.jpg'
import album12 from '../../assets/siddhita-kanad/albumdata/57189ae4-f7f0-42e1-b812-221662fc9e92_rw_1920.jpg'
import album13 from '../../assets/siddhita-kanad/albumdata/74d17729-2cba-4cdd-a1ed-32d900df52d2_rw_1920.jpg'
import album14 from '../../assets/siddhita-kanad/albumdata/7852ac26-33aa-42ab-82c6-1774674a4020_rw_1920.jpg'
import album15 from '../../assets/siddhita-kanad/albumdata/830d1ab9-4b5e-4fbb-ab07-4d45c07c4692_rw_1920.jpg'
import album16 from '../../assets/siddhita-kanad/albumdata/8d729506-2fe5-4f93-95c7-8f0ed5be5ac3_rw_1920.jpg'
import album17 from '../../assets/siddhita-kanad/albumdata/9fee9aa2-ea63-4ae0-a1ea-a34bc3b45c71_rw_1920.jpg'
import album18 from '../../assets/siddhita-kanad/albumdata/a0f7f723-fba8-412b-8e4f-800186fa487d_rw_1920.jpg'
import album19 from '../../assets/siddhita-kanad/albumdata/be069f8f-8d21-4a5b-8a83-4b401a9d9f66_rw_1920.jpg'
import album20 from '../../assets/siddhita-kanad/albumdata/cc7cabd4-2cee-454f-999a-1bb5728b1d87_rw_1920.jpg'
import album21 from '../../assets/siddhita-kanad/albumdata/cd2246b4-dc61-42c8-b532-58c9a811ef53_rw_1920.jpg'
import album22 from '../../assets/siddhita-kanad/albumdata/cd6f2276-1f7b-4d5e-a604-fbd7c6e5d825_rw_1920.jpg'
import album23 from '../../assets/siddhita-kanad/albumdata/d171c59f-fcdf-45d8-9920-083fb510de1d_rw_1920.jpg'
import album24 from '../../assets/siddhita-kanad/albumdata/dc6cd392-8df8-49c7-a243-d1b45a5f948a_rw_1920.jpg'

const albumImages = [
  { id: 1, src: album1, title: 'Wedding Album – 2024', alt: 'Wedding Album 2024' },
  { id: 2, src: album2, title: 'Wedding Album – 2024', alt: 'Wedding Album 2024' },
  { id: 3, src: album3, title: 'Wedding Album – 2023', alt: 'Wedding Album 2023' },
  { id: 4, src: album4, title: 'Wedding Album – 2023', alt: 'Wedding Album 2023' },
  { id: 5, src: album5, title: 'Wedding Album – 2024', alt: 'Wedding Album 2024' },
  { id: 6, src: album6, title: 'Wedding Album – 2023', alt: 'Wedding Album 2023' },
  { id: 7, src: album7, title: 'Wedding Album – 2024', alt: 'Wedding Album 2024' },
  { id: 8, src: album8, title: 'Wedding Album – 2023', alt: 'Wedding Album 2023' },
  { id: 9, src: album9, title: 'Wedding Album – 2024', alt: 'Wedding Album 2024' },
  { id: 10, src: album10, title: 'Wedding Album – 2023', alt: 'Wedding Album 2023' },
  { id: 11, src: album11, title: 'Wedding Album – 2024', alt: 'Wedding Album 2024' },
  { id: 12, src: album12, title: 'Wedding Album – 2023', alt: 'Wedding Album 2023' },
  { id: 13, src: album13, title: 'Wedding Album – 2024', alt: 'Wedding Album 2024' },
  { id: 14, src: album14, title: 'Wedding Album – 2023', alt: 'Wedding Album 2023' },
  { id: 15, src: album15, title: 'Wedding Album – 2024', alt: 'Wedding Album 2024' },
  { id: 16, src: album16, title: 'Wedding Album – 2023', alt: 'Wedding Album 2023' },
  { id: 17, src: album17, title: 'Wedding Album – 2024', alt: 'Wedding Album 2024' },
  { id: 18, src: album18, title: 'Wedding Album – 2023', alt: 'Wedding Album 2023' },
  { id: 19, src: album19, title: 'Wedding Album – 2024', alt: 'Wedding Album 2024' },
  { id: 20, src: album20, title: 'Wedding Album – 2023', alt: 'Wedding Album 2023' },
  { id: 21, src: album21, title: 'Wedding Album – 2024', alt: 'Wedding Album 2024' },
  { id: 22, src: album22, title: 'Wedding Album – 2023', alt: 'Wedding Album 2023' },
  { id: 23, src: album23, title: 'Wedding Album – 2024', alt: 'Wedding Album 2024' },
  { id: 24, src: album24, title: 'Wedding Album – 2023', alt: 'Wedding Album 2023' },
]

const AlbumShowcase = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const openLightbox = (index) => {
    setCurrentImageIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? albumImages.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === albumImages.length - 1 ? 0 : prev + 1))
  }

  const handleKeyDown = (e) => {
    if (!lightboxOpen) return
    if (e.key === 'ArrowLeft') goToPrevious()
    if (e.key === 'ArrowRight') goToNext()
    if (e.key === 'Escape') closeLightbox()
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, currentImageIndex])

  return (
    <section className="bg-primary py-24">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-heading font-bold text-textSecondary">
            Album Designing
          </h2>
        </div>

        <AlbumGrid images={albumImages} onImageClick={openLightbox} />
      </div>

      {lightboxOpen && (
        <div 
          className="fixed inset-0 bg-[#0B1120]/90 z-50 flex items-center justify-center p-4 overflow-auto"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="fixed top-4 right-4 text-textPrimary hover:text-accentLight transition-colors z-50"
          >
            <svg className="w-8 h-8" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              goToPrevious()
            }}
            className="fixed left-4 top-1/2 -translate-y-1/2 text-textPrimary hover:text-accentLight transition-colors z-50"
          >
            <svg className="w-12 h-12" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div 
            className="relative max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={albumImages[currentImageIndex].src} 
              alt={albumImages[currentImageIndex].alt}
              className="max-w-full max-h-[95vh] w-auto h-auto object-contain"
            />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
            className="fixed right-4 top-1/2 -translate-y-1/2 text-textPrimary hover:text-accentLight transition-colors z-50"
          >
            <svg className="w-12 h-12" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-textPrimary text-sm">
            {currentImageIndex + 1} / {albumImages.length}
          </div>
        </div>
      )}
    </section>
  )
}

export default AlbumShowcase
