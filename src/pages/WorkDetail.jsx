import { useState, useEffect } from 'react'
import AlbumShowcase from '../components/sections/AlbumShowcase'
import AlbumGrid from '../components/album/AlbumGrid'
import SuggestionSection from '../components/work/SuggestionSection'
import { useParams, Link } from 'react-router-dom'
import { caseStudies } from '../data/content'
import { allCases } from '../data/cases'
import long1 from '../assets/siddhita-kanad/long-1.jpg'
import long2 from '../assets/siddhita-kanad/long2.jpg'
import short1 from '../assets/siddhita-kanad/short1.jpg'
import short2 from '../assets/siddhita-kanad/short2.jpg'
import short3 from '../assets/siddhita-kanad/short3.jpg'

import album1 from '../assets/siddhita-kanad/albumdata/063fd5d7-ac84-4b6c-82af-7a18f8496ab0_rw_1920.jpg'
import album2 from '../assets/siddhita-kanad/albumdata/0787542f-505d-44f8-99e7-99f0549f179a_rw_1920.jpg'
import album3 from '../assets/siddhita-kanad/albumdata/1156ae2f-725d-4574-8709-f64854e41d46_rw_1920.jpg'
import album4 from '../assets/siddhita-kanad/albumdata/119f3125-7366-4866-a96e-b49100dc8481_rw_1920.jpg'
import album5 from '../assets/siddhita-kanad/albumdata/12212b2b-b556-43e7-9159-2be9c0f6dfe5_rw_1920.jpg'
import album6 from '../assets/siddhita-kanad/albumdata/23014c2c-e0be-472d-90c6-3de94f795fb4_rw_1920.jpg'
import album7 from '../assets/siddhita-kanad/albumdata/26f89827-ff09-44b6-a061-8c5346de155a_rw_1920.jpg'
import album8 from '../assets/siddhita-kanad/albumdata/33ffae60-822f-47ec-a44b-e062ca6801b1_rw_1920.jpg'
import album9 from '../assets/siddhita-kanad/albumdata/3b05b371-7806-40f0-a4d3-1db5bbc24b8f_rw_1920.jpg'
import album10 from '../assets/siddhita-kanad/albumdata/3ccf3ca3-7a80-404d-824f-cba9cecc2d62_rw_1920.jpg'
import album11 from '../assets/siddhita-kanad/albumdata/4c76c2fc-0629-4978-9121-6fadc4c09287_rw_1920.jpg'
import album12 from '../assets/siddhita-kanad/albumdata/57189ae4-f7f0-42e1-b812-221662fc9e92_rw_1920.jpg'
import album13 from '../assets/siddhita-kanad/albumdata/74d17729-2cba-4cdd-a1ed-32d900df52d2_rw_1920.jpg'
import album14 from '../assets/siddhita-kanad/albumdata/7852ac26-33aa-42ab-82c6-1774674a4020_rw_1920.jpg'
import album15 from '../assets/siddhita-kanad/albumdata/830d1ab9-4b5e-4fbb-ab07-4d45c07c4692_rw_1920.jpg'
import album16 from '../assets/siddhita-kanad/albumdata/8d729506-2fe5-4f93-95c7-8f0ed5be5ac3_rw_1920.jpg'
import album17 from '../assets/siddhita-kanad/albumdata/9fee9aa2-ea63-4ae0-a1ea-a34bc3b45c71_rw_1920.jpg'
import album18 from '../assets/siddhita-kanad/albumdata/a0f7f723-fba8-412b-8e4f-800186fa487d_rw_1920.jpg'
import album19 from '../assets/siddhita-kanad/albumdata/be069f8f-8d21-4a5b-8a83-4b401a9d9f66_rw_1920.jpg'
import album20 from '../assets/siddhita-kanad/albumdata/cc7cabd4-2cee-454f-999a-1bb5728b1d87_rw_1920.jpg'
import album21 from '../assets/siddhita-kanad/albumdata/cd2246b4-dc61-42c8-b532-58c9a811ef53_rw_1920.jpg'
import album22 from '../assets/siddhita-kanad/albumdata/cd6f2276-1f7b-4d5e-a604-fbd7c6e5d825_rw_1920.jpg'
import album23 from '../assets/siddhita-kanad/albumdata/d171c59f-fcdf-45d8-9920-083fb510de1d_rw_1920.jpg'
import album24 from '../assets/siddhita-kanad/albumdata/dc6cd392-8df8-49c7-a243-d1b45a5f948a_rw_1920.jpg'

const WorkDetail = () => {
  const { slug } = useParams()
  const project = caseStudies.find((s) => s.slug === slug) ?? allCases.find((s) => s.slug === slug)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const albumImages = [
    { id: 1, src: album1, title: 'Siddhita & Kanad Wedding Album', alt: 'Wedding Album Photo 1' },
    { id: 2, src: album2, title: 'Siddhita & Kanad Wedding Album', alt: 'Wedding Album Photo 2' },
    { id: 3, src: album3, title: 'Siddhita & Kanad Wedding Album', alt: 'Wedding Album Photo 3' },
    { id: 4, src: album4, title: 'Siddhita & Kanad Wedding Album', alt: 'Wedding Album Photo 4' },
    { id: 5, src: album5, title: 'Siddhita & Kanad Wedding Album', alt: 'Wedding Album Photo 5' },
    { id: 6, src: album6, title: 'Siddhita & Kanad Wedding Album', alt: 'Wedding Album Photo 6' },
    { id: 7, src: album7, title: 'Siddhita & Kanad Wedding Album', alt: 'Wedding Album Photo 7' },
    { id: 8, src: album8, title: 'Siddhita & Kanad Wedding Album', alt: 'Wedding Album Photo 8' },
    { id: 9, src: album9, title: 'Siddhita & Kanad Wedding Album', alt: 'Wedding Album Photo 9' },
    { id: 10, src: album10, title: 'Siddhita & Kanad Wedding Album', alt: 'Wedding Album Photo 10' },
    { id: 11, src: album11, title: 'Siddhita & Kanad Wedding Album', alt: 'Wedding Album Photo 11' },
    { id: 12, src: album12, title: 'Siddhita & Kanad Wedding Album', alt: 'Wedding Album Photo 12' },
    { id: 13, src: album13, title: 'Siddhita & Kanad Wedding Album', alt: 'Wedding Album Photo 13' },
    { id: 14, src: album14, title: 'Siddhita & Kanad Wedding Album', alt: 'Wedding Album Photo 14' },
    { id: 15, src: album15, title: 'Siddhita & Kanad Wedding Album', alt: 'Wedding Album Photo 15' },
    { id: 16, src: album16, title: 'Siddhita & Kanad Wedding Album', alt: 'Wedding Album Photo 16' },
    { id: 17, src: album17, title: 'Siddhita & Kanad Wedding Album', alt: 'Wedding Album Photo 17' },
    { id: 18, src: album18, title: 'Siddhita & Kanad Wedding Album', alt: 'Wedding Album Photo 18' },
    { id: 19, src: album19, title: 'Siddhita & Kanad Wedding Album', alt: 'Wedding Album Photo 19' },
    { id: 20, src: album20, title: 'Siddhita & Kanad Wedding Album', alt: 'Wedding Album Photo 20' },
    { id: 21, src: album21, title: 'Siddhita & Kanad Wedding Album', alt: 'Wedding Album Photo 21' },
    { id: 22, src: album22, title: 'Siddhita & Kanad Wedding Album', alt: 'Wedding Album Photo 22' },
    { id: 23, src: album23, title: 'Siddhita & Kanad Wedding Album', alt: 'Wedding Album Photo 23' },
    { id: 24, src: album24, title: 'Siddhita & Kanad Wedding Album', alt: 'Wedding Album Photo 24' },
  ]

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

  // Add keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, currentImageIndex])

  if (!project) {
    return (
      <div className="py-24">
        <div className="section-container text-center">
          <h1 className="text-4xl font-heading font-bold text-textPrimary mb-6">
            Project Not Found
          </h1>
          <Link to="/work" className="btn-primary inline-block">
            Back to Work
          </Link>
        </div>
      </div>
    )
  }

  // Custom layout for Siddhita & Kanad wedding
  if (slug === 'siddhita-kanad-wedding') {
    return (
      <div className="min-h-screen bg-primary py-20">
        <div className="max-w-5xl mx-auto px-5">
          {/* Back Button */}
          <Link
            to="/work"
            className="inline-flex items-center text-textSecondary hover:text-accent transition-colors duration-200 mb-12"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
            Back to Work
          </Link>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl text-center mb-8 text-textPrimary" style={{ fontFamily: "'Great Vibes', cursive" }}>
            Siddhita & Kanad
          </h1>

          {/* Photo Grid */}
          <div className="space-y-4">
            {/* Top Row - 2 Large Images (3:2 ratio) */}
            <div className="grid grid-cols-2 gap-4">
              <img 
                src={long1} 
                alt="Siddhita & Kanad 1" 
                className="w-full aspect-[3/2] object-cover rounded-lg"
              />
              <img 
                src={long2} 
                alt="Siddhita & Kanad 2" 
                className="w-full aspect-[3/2] object-cover rounded-lg"
              />
            </div>

            {/* Bottom Row - 3 Smaller Images (2:3 ratio) */}
            <div className="grid grid-cols-3 gap-4">
              <img 
                src={short1} 
                alt="Siddhita & Kanad 3" 
                className="w-full aspect-[2/3] object-cover rounded-lg"
              />
              <img 
                src={short2} 
                alt="Siddhita & Kanad 4" 
                className="w-full aspect-[2/3] object-cover rounded-lg"
              />
              <img 
                src={short3} 
                alt="Siddhita & Kanad 5" 
                className="w-full aspect-[2/3] object-cover rounded-lg"
              />
            </div>
          </div>

          {/* Video Section */}
          <div className="mt-20">
            <h2 className="text-3xl md:text-4xl text-center mb-12 text-textSecondary font-medium tracking-wide">
              Video
            </h2>
            
            <div className="relative aspect-video rounded-lg overflow-hidden bg-surface">
              {/* Video Element - Replace src with actual video file path */}
              <video 
                controls
                poster={long1}
                className="w-full h-full object-cover"
              >
                <source src="/path-to-wedding-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>

        {/* Masonry Album Gallery */}
        <div className="max-w-7xl mx-auto px-5 mt-20">
          <h2 className="text-3xl md:text-4xl text-center mb-12 text-textSecondary font-medium tracking-wide">
            Album Gallery
          </h2>
          
          <AlbumGrid images={albumImages} onImageClick={openLightbox} />
        </div>

        {/* Lightbox Modal */}
        <div>
          {lightboxOpen && (
            <div 
              className="fixed inset-0 bg-[#0B1120]/90 z-50 flex items-center justify-center p-4 overflow-auto"
              onClick={closeLightbox}
            >
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="fixed top-4 right-4 text-textPrimary hover:text-accentLight transition-colors z-50"
              >
                <svg className="w-8 h-8" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Previous Button */}
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

              {/* Image */}
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

              {/* Next Button */}
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

              {/* Image Counter */}
              <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-textPrimary text-sm">
                {currentImageIndex + 1} / {albumImages.length}
              </div>
            </div>
          )}
        </div>

        {/* Suggestion Section */}
        <SuggestionSection currentProjectSlug={slug} currentCategory="EVENTS" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary py-20">
      <div className="max-w-[700px] mx-auto px-5">
        {/* Back Button */}
        <Link
          to="/work"
          className="inline-flex items-center text-textSecondary hover:text-accent transition-colors duration-200 mb-8"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Back to Work
        </Link>

        {/* Project Header */}
        <div className="mb-12">
          <span className="text-accentLight font-medium mb-4 block">
            {project.category}
          </span>
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-textPrimary mb-6">
            {project.title}
          </h1>
          <p className="text-xl text-textSecondary max-w-3xl">
            {project.description}
          </p>
        </div>

        {/* Project Image */}
        <div className="relative rounded-2xl overflow-hidden aspect-video mb-16">
          {project.image ? (
            <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-surface flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl">📸</div>
                <p className="text-textSecondary font-medium">FEATURED PROJECT IMAGE</p>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {project.results && Object.keys(project.results).length > 0 && (
        <div className="mb-16">
          <h2 className="text-3xl font-heading font-bold text-textPrimary mb-8">
            Results
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {Object.entries(project.results).map(([key, value]) => (
              <div key={key} className="glass-card p-8 text-center">
                <div className="text-4xl font-heading font-bold text-accent mb-2">
                  {value.split(' ')[0]}
                </div>
                <div className="text-textSecondary">
                  {value.split(' ').slice(1).join(' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Additional Content Sections */}
        <div className="space-y-16">
          <div>
            <h2 className="text-3xl font-heading font-bold text-textPrimary mb-6">
              The Challenge
            </h2>
            <p className="text-textSecondary text-lg leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-heading font-bold text-textPrimary mb-6">
              Our Approach
            </h2>
            <p className="text-textSecondary text-lg leading-relaxed mb-8">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            {/* Additional Image Placeholders */}
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="aspect-video rounded-xl bg-surface flex items-center justify-center">
                  <p className="text-textSecondary">Additional Image {i}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-heading font-bold text-textPrimary mb-6">
              The Impact
            </h2>
            <p className="text-textSecondary text-lg leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 text-center">
          <h3 className="text-3xl font-heading font-bold text-textPrimary mb-6">
            Ready to Achieve Similar Results?
          </h3>
          <Link to="/contact" className="btn-primary inline-block">
            Start Your Project
          </Link>
        </div>
      </div>

      {/* Suggestion Section */}
      <SuggestionSection currentProjectSlug={slug} currentCategory={project.category} />
    </div>
  )
}

export default WorkDetail
